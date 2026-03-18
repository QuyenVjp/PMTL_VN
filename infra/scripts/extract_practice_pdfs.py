from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import sys
import unicodedata
from dataclasses import dataclass
from pathlib import Path

import fitz
import pdfplumber
import pytesseract
from PIL import Image
from pypdf import PdfReader


ROOT_DIR = Path(__file__).resolve().parents[2]
DEFAULT_SOURCE_DIR = Path(r"D:/downloadALL/brave-download/KINH SACH VA HD")
DEFAULT_OUTPUT_DIR = ROOT_DIR / "design" / "01-content" / "practice-pdf-extracts"
SYSTEM_TESSERACT = Path(r"C:/Program Files/Tesseract-OCR/tesseract.exe")
SYSTEM_TESSDATA = Path(r"C:/Program Files/Tesseract-OCR/tessdata")
LOCAL_TESSDATA = ROOT_DIR / "infra" / "tools" / "tessdata"
TEXT_THRESHOLD = 120


@dataclass(frozen=True)
class FlowHint:
    key: str
    title_vi: str
    title_en: str
    module_targets: list[str]


FLOW_HINTS: list[tuple[re.Pattern[str], FlowHint]] = [
    (
        re.compile(r"niệm kinh bài tập|công khóa|hằng ngày", re.IGNORECASE),
        FlowHint(
            key="daily-recitation-flow",
            title_vi="Công khóa hằng ngày",
            title_en="Daily recitation flow",
            module_targets=["content", "engagement"],
        ),
    ),
    (
        re.compile(r"tâm hương", re.IGNORECASE),
        FlowHint(
            key="mental-incense-flow",
            title_vi="Thắp tâm hương",
            title_en="Mental incense flow",
            module_targets=["content"],
        ),
    ),
    (
        re.compile(r"phát nguyện", re.IGNORECASE),
        FlowHint(
            key="vow-making-flow",
            title_vi="Phát nguyện",
            title_en="Vow making flow",
            module_targets=["content"],
        ),
    ),
    (
        re.compile(r"phóng sinh|phong sinh", re.IGNORECASE),
        FlowHint(
            key="life-release-flow",
            title_vi="Phóng sinh",
            title_en="Life release flow",
            module_targets=["content", "calendar"],
        ),
    ),
    (
        re.compile(r"ngôi nhà nhỏ|xiao fang zi|小房子", re.IGNORECASE),
        FlowHint(
            key="little-house-recitation-flow",
            title_vi="Ngôi Nhà Nhỏ",
            title_en="Little House recitation flow",
            module_targets=["content", "engagement"],
        ),
    ),
    (
        re.compile(r"đốt.+không có bàn thờ|ngôi nhà nhỏ.+không có bàn thờ|không có bàn thờ.+ngôi nhà nhỏ", re.IGNORECASE),
        FlowHint(
            key="little-house-burning-without-altar-flow",
            title_vi="Đốt Ngôi Nhà Nhỏ không có bàn thờ",
            title_en="Little House burning without altar flow",
            module_targets=["content"],
        ),
    ),
]


VIETNAMESE_HINT_RE = re.compile(r"[ăâđêôơưáàảãạấầẩẫậắằẳẵặéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ]", re.IGNORECASE)
CJK_RE = re.compile(r"[\u2e80-\u2fdf\u3000-\u303f\u31c0-\u31ef\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]")


def slugify(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value)
    ascii_text = normalized.encode("ascii", "ignore").decode("ascii")
    ascii_text = ascii_text.lower()
    ascii_text = re.sub(r"[^a-z0-9]+", "-", ascii_text).strip("-")
    return ascii_text or "document"


def collapse_whitespace(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def strip_cjk(value: str) -> str:
    return collapse_whitespace(CJK_RE.sub(" ", value))


def is_vietnamese_friendly_line(line: str) -> bool:
    stripped = strip_cjk(line)
    if len(stripped) < 12:
        return False
    if not re.search(r"[A-Za-z]", stripped):
        return False
    common_words = [
        "nam mô",
        "bước",
        "niệm",
        "kinh",
        "chú",
        "cảm tạ",
        "thỉnh cầu",
        "quán thế âm",
        "bồ tát",
        "phật",
        "tịnh khẩu",
        "ngôi nhà nhỏ",
        "phóng sinh",
    ]
    lowered = stripped.lower()
    return bool(VIETNAMESE_HINT_RE.search(stripped)) or any(word in lowered for word in common_words)


def vietnamese_only_text(value: str) -> str:
    kept_lines: list[str] = []
    for raw_line in value.splitlines():
        candidate = strip_cjk(raw_line)
        if is_vietnamese_friendly_line(candidate):
            kept_lines.append(candidate)
    return "\n".join(kept_lines).strip()


def ensure_tessdata() -> Path:
    LOCAL_TESSDATA.mkdir(parents=True, exist_ok=True)

    for filename in ("eng.traineddata", "osd.traineddata"):
        source = SYSTEM_TESSDATA / filename
        target = LOCAL_TESSDATA / filename
        if source.exists() and not target.exists():
            shutil.copy2(source, target)

    return LOCAL_TESSDATA


def configure_tesseract() -> tuple[Path, Path]:
    if not SYSTEM_TESSERACT.exists():
        raise FileNotFoundError(f"Missing tesseract executable at {SYSTEM_TESSERACT}")

    pytesseract.pytesseract.tesseract_cmd = str(SYSTEM_TESSERACT)
    tessdata_dir = ensure_tessdata()
    os.environ["TESSDATA_PREFIX"] = str(tessdata_dir)
    return SYSTEM_TESSERACT, tessdata_dir


def ensure_language_file(tessdata_dir: Path, language_code: str) -> bool:
    target = tessdata_dir / f"{language_code}.traineddata"
    if target.exists():
        return True

    url = f"https://github.com/tesseract-ocr/tessdata_fast/raw/main/{language_code}.traineddata"
    try:
        import urllib.request

        with urllib.request.urlopen(url, timeout=120) as response:
            target.write_bytes(response.read())
        return True
    except Exception:
        return False


def available_languages(tessdata_dir: Path) -> list[str]:
    langs = ["eng", "osd"]
    for language_code in ("vie", "chi_sim"):
        if ensure_language_file(tessdata_dir, language_code):
            langs.append(language_code)
    return langs


def detect_flow_hints(name: str, combined_text: str) -> list[FlowHint]:
    haystack = f"{name}\n{combined_text[:6000]}"
    matches: list[FlowHint] = []
    seen: set[str] = set()
    for pattern, hint in FLOW_HINTS:
        if pattern.search(haystack) and hint.key not in seen:
            matches.append(hint)
            seen.add(hint.key)
    return matches


def detect_business_signals(combined_text: str) -> dict[str, bool]:
    trimmed = combined_text[:12000]
    return {
        "has_prayer_template": bool(re.search(r"thỉnh cầu|cảm tạ|khấn", trimmed, re.IGNORECASE)),
        "has_recommended_counts": bool(re.search(r"\b\d+\s*biến\b|\btarget\b", trimmed, re.IGNORECASE)),
        "has_time_rules": bool(re.search(r"thời gian|5h|12h|ban ngày|ban đêm|ngày âm", trimmed, re.IGNORECASE)),
        "has_step_flow": bool(re.search(r"bước\s*\d+|quy trình|trình tự", trimmed, re.IGNORECASE)),
        "has_checklist_potential": bool(re.search(r"chuẩn bị|lưu ý|chú ý|không có bàn thờ", trimmed, re.IGNORECASE)),
    }


def detect_presentation_mode(slug: str) -> str:
    if slug == "2-sach-kinh":
        return "image_first_vietnamese_text"
    if slug in {
        "6-phuong-phap-tung-niem-ngoi-nha-nho-va-nhung-ieu-can-luu-y",
        "7-quy-trinh-ot-ngoi-nha-nho-khong-co-ban-tho-pmtl",
    }:
        return "vietnamese_priority_text"
    return "balanced_text_and_images"


def page_extraction_method(direct_text: str, ocr_text: str) -> str:
    direct_len = len(collapse_whitespace(direct_text))
    ocr_len = len(collapse_whitespace(ocr_text))
    if direct_len >= TEXT_THRESHOLD:
        return "pdf_text"
    if ocr_len >= TEXT_THRESHOLD:
        return "ocr"
    if direct_len > 0 or ocr_len > 0:
        return "hybrid_low_signal"
    return "empty"


def page_confidence(method: str, text: str) -> str:
    text_len = len(collapse_whitespace(text))
    if method == "pdf_text" and text_len >= TEXT_THRESHOLD:
        return "high"
    if method in {"ocr", "hybrid_low_signal"} and text_len >= 60:
        return "medium"
    if text_len > 0:
        return "low"
    return "low"


def document_source_type(page_methods: list[str]) -> str:
    if page_methods and all(method == "pdf_text" for method in page_methods):
        return "text_pdf"
    if any(method == "ocr" for method in page_methods):
        return "mixed_text_and_scan_pdf" if any(method == "pdf_text" for method in page_methods) else "scanned_image_pdf"
    return "mixed_text_and_scan_pdf"


def document_extraction_method(page_methods: list[str]) -> str:
    if page_methods and all(method == "pdf_text" for method in page_methods):
        return "direct_text_extraction"
    if any(method == "ocr" for method in page_methods):
        return "hybrid_text_extraction_plus_ocr"
    return "direct_text_extraction_with_low_signal_pages"


def document_confidence(page_confidences: list[str], source_type: str, page_count: int) -> str:
    high_count = page_confidences.count("high")
    medium_count = page_confidences.count("medium")
    if source_type == "text_pdf" and high_count == page_count:
        return "high"
    if high_count + medium_count >= max(1, page_count - 1):
        return "medium"
    return "low"


def document_needs_review(source_type: str, confidence: str, business_signals: dict[str, bool]) -> bool:
    if source_type != "text_pdf":
        return True
    if confidence != "high":
        return True
    return business_signals["has_checklist_potential"] or business_signals["has_prayer_template"]


def render_page(page: fitz.Page, image_path: Path, dpi: int) -> None:
    matrix = fitz.Matrix(dpi / 72, dpi / 72)
    pixmap = page.get_pixmap(matrix=matrix, alpha=False)
    pixmap.save(str(image_path))


def extract_document(
    pdf_path: Path,
    output_dir: Path,
    dpi: int,
    ocr_languages: list[str],
    tessdata_dir: Path,
) -> dict[str, object]:
    slug = slugify(pdf_path.stem)
    presentation_mode = detect_presentation_mode(slug)
    document_dir = output_dir / slug
    images_dir = document_dir / "images"
    json_path = document_dir / "document.json"
    md_path = document_dir / "document.md"

    if document_dir.exists():
        shutil.rmtree(document_dir)
    images_dir.mkdir(parents=True, exist_ok=True)

    direct_reader = PdfReader(str(pdf_path))
    fitz_doc = fitz.open(pdf_path)
    plumber_doc = pdfplumber.open(pdf_path)
    page_records: list[dict[str, object]] = []
    page_methods: list[str] = []
    page_confidences: list[str] = []
    combined_text_parts: list[str] = []
    ocr_lang = "+".join(ocr_languages)
    ocr_config = f"--tessdata-dir {tessdata_dir}"

    try:
        for page_index, fitz_page in enumerate(fitz_doc, start=1):
            image_path = images_dir / f"page-{page_index:03d}.png"
            render_page(fitz_page, image_path, dpi)

            direct_text = ""
            if page_index - 1 < len(plumber_doc.pages):
                direct_text = plumber_doc.pages[page_index - 1].extract_text() or ""
            if not collapse_whitespace(direct_text):
                direct_text = fitz_page.get_text("text") or ""

            ocr_text = ""
            if len(collapse_whitespace(direct_text)) < TEXT_THRESHOLD:
                with Image.open(image_path) as image:
                    ocr_text = pytesseract.image_to_string(image, lang=ocr_lang, config=ocr_config)

            method = page_extraction_method(direct_text, ocr_text)
            final_text = direct_text if len(collapse_whitespace(direct_text)) >= len(collapse_whitespace(ocr_text)) else ocr_text
            display_text = strip_cjk(final_text)
            if presentation_mode == "image_first_vietnamese_text":
                if method == "pdf_text":
                    display_text = vietnamese_only_text(final_text)
                else:
                    display_text = ""
            elif presentation_mode == "vietnamese_priority_text":
                display_text = vietnamese_only_text(final_text)
            confidence = page_confidence(method, final_text)
            excerpt_source = display_text or ""
            excerpt = collapse_whitespace(excerpt_source)[:280] or "Xem ảnh trang để đối chiếu nội dung gốc."

            page_methods.append(method)
            page_confidences.append(confidence)
            if display_text:
                combined_text_parts.append(f"## Page {page_index}\n\n{display_text.strip()}\n")

            page_records.append(
                {
                    "page_number": page_index,
                    "image_path": image_path.relative_to(output_dir).as_posix(),
                    "direct_text_length": len(collapse_whitespace(direct_text)),
                    "ocr_text_length": len(collapse_whitespace(ocr_text)),
                    "final_text_length": len(collapse_whitespace(final_text)),
                    "display_text_length": len(collapse_whitespace(display_text)),
                    "extraction_method": method,
                    "confidence": confidence,
                    "excerpt": excerpt,
                    "display_mode": "image_first" if presentation_mode == "image_first_vietnamese_text" else "balanced",
                    "needs_review": method != "pdf_text",
                }
            )
    finally:
        plumber_doc.close()
        fitz_doc.close()

    combined_text = "\n".join(combined_text_parts).strip()
    source_type = document_source_type(page_methods)
    extraction_method = document_extraction_method(page_methods)
    confidence = document_confidence(page_confidences, source_type, len(page_records))
    flow_hints = detect_flow_hints(pdf_path.name, combined_text)
    business_signals = detect_business_signals(combined_text)
    needs_review = document_needs_review(source_type, confidence, business_signals)

    document_record: dict[str, object] = {
        "title": pdf_path.stem,
        "slug": slug,
        "presentation_mode": presentation_mode,
        "source_path": str(pdf_path),
        "page_count": len(direct_reader.pages),
        "source_type": source_type,
        "extraction_method": extraction_method,
        "confidence": confidence,
        "needs_review": needs_review,
        "ocr_languages": ocr_languages,
        "flow_hints": [
            {
                "key": hint.key,
                "title_vi": hint.title_vi,
                "title_en": hint.title_en,
                "module_targets": hint.module_targets,
            }
            for hint in flow_hints
        ],
        "business_signals": business_signals,
        "page_records": page_records,
        "combined_text_markdown_path": md_path.relative_to(output_dir).as_posix(),
        "json_path": json_path.relative_to(output_dir).as_posix(),
    }

    json_path.write_text(json.dumps(document_record | {"combined_text": combined_text}, ensure_ascii=False, indent=2), encoding="utf-8")
    md_path.write_text(build_markdown_document(document_record, combined_text), encoding="utf-8")

    return document_record


def build_markdown_document(document_record: dict[str, object], combined_text: str) -> str:
    flow_hints = document_record["flow_hints"]
    page_records = document_record["page_records"]
    lines: list[str] = [
        f"# {document_record['title']}",
        "",
        "> Ghi chú cho sinh viên:",
        "> File này được tạo tự động từ pipeline local.",
        "> Mục tiêu là giúp đọc nhanh tài liệu PDF và đánh dấu phần nào cần review thêm.",
        "",
        "## Metadata",
        f"- `source_path`: `{document_record['source_path']}`",
        f"- `page_count`: `{document_record['page_count']}`",
        f"- `source_type`: `{document_record['source_type']}`",
        f"- `extraction_method`: `{document_record['extraction_method']}`",
        f"- `confidence`: `{document_record['confidence']}`",
        f"- `needs_review`: `{str(document_record['needs_review']).lower()}`",
        f"- `ocr_languages`: `{', '.join(document_record['ocr_languages'])}`",
        f"- `presentation_mode`: `{document_record['presentation_mode']}`",
        "",
        "## Flow hints",
    ]

    if flow_hints:
        for hint in flow_hints:
            lines.extend(
                [
                    f"- `{hint['key']}`",
                    f"  - tiếng Việt: {hint['title_vi']}",
                    f"  - English: {hint['title_en']}",
                    f"  - module targets: {', '.join(hint['module_targets'])}",
                ]
            )
    else:
        lines.append("- chưa detect được flow hint rõ ràng từ tên file/text")

    lines.extend(
        [
            "",
            "## Business signals",
        ]
    )
    for key, value in document_record["business_signals"].items():
        lines.append(f"- `{key}`: `{str(value).lower()}`")

    lines.extend(
        [
            "",
            "## Page review",
            "| Page | Method | Confidence | Needs review | Image | Excerpt |",
            "|---|---|---|---|---|---|",
        ]
    )

    for page in page_records:
        excerpt = str(page["excerpt"]).replace("|", "\\|")
        lines.append(
            f"| {page['page_number']} | `{page['extraction_method']}` | `{page['confidence']}` | `{str(page['needs_review']).lower()}` | `{page['image_path']}` | {excerpt} |"
        )

    if document_record["presentation_mode"] == "image_first_vietnamese_text":
        lines.extend(
            [
                "",
                "## Cách đọc file này",
                "- File này ưu tiên xem ảnh trang vì phần script gốc có nhiều Hán tự và phiên âm.",
                "- Phần văn bản bên dưới chỉ giữ snippet Việt ngữ tương đối sạch để định hướng nhanh.",
                "- Nếu cần đối chiếu chuẩn, hãy mở thư mục `images/` của tài liệu này.",
                "",
                "## Vietnamese-only notes",
                "",
                combined_text or "_Không tạo được snippet Việt ngữ đủ sạch. Hãy đọc qua ảnh từng trang._",
                "",
            ]
        )
    elif document_record["presentation_mode"] == "vietnamese_priority_text":
        lines.extend(
            [
                "",
                "## Cách đọc file này",
                "- File này ưu tiên phần tiếng Việt sạch để phục vụ design và UI.",
                "- Các đoạn chữ Hán hoặc layout rối đã được loại khỏi phần hiển thị.",
                "- Nếu cần đối chiếu nguyên bản, hãy mở thư mục `images/`.",
                "",
                "## Vietnamese-priority text",
                "",
                combined_text or "_Không tạo được đoạn Việt ngữ đủ sạch. Hãy đọc qua ảnh từng trang._",
                "",
            ]
        )
    else:
        lines.extend(
            [
                "",
                "## Combined text",
                "",
                combined_text,
                "",
            ]
        )
    return "\n".join(lines)


def build_index_markdown(records: list[dict[str, object]], output_dir: Path) -> str:
    lines = [
        "# Practice PDF Extract Index",
        "",
        "> Ghi chú cho sinh viên:",
        "> Đây là thư mục output tự động từ pipeline local PDF.",
        "> Mỗi tài liệu có bản `.md`, `.json`, và ảnh từng trang để anh mở preview trong VS Code.",
        "",
        "## Cấu trúc thư mục",
        "- Mỗi tài liệu có một thư mục riêng theo slug.",
        "- `document.md`: bản dễ đọc cho người.",
        "- `document.json`: bản có cấu trúc cho AI/script.",
        "- `images/`: ảnh từng trang đã render.",
        "",
        "## Tài liệu đã extract",
        "| Tài liệu | Source type | Method | Confidence | Needs review | Flow hints | Folder |",
        "|---|---|---|---|---|---|---|",
    ]

    for record in records:
        flow_keys = ", ".join(hint["key"] for hint in record["flow_hints"]) or "-"
        lines.append(
            f"| {record['title']} | `{record['source_type']}` | `{record['extraction_method']}` | `{record['confidence']}` | `{str(record['needs_review']).lower()}` | {flow_keys} | `{record['slug']}` |"
        )

    lines.extend(
        [
            "",
            "## Mẹo dùng",
            "- Nếu muốn đọc nhanh: mở `document.md`.",
            "- Nếu muốn feed cho AI hoặc script khác: mở `document.json`.",
            "- Nếu muốn kiểm tra scan/infographic: mở thư mục `images/`.",
        ]
    )
    return "\n".join(lines)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Extract PMTL practice PDFs into markdown/json/image outputs.")
    parser.add_argument("--source-dir", type=Path, default=DEFAULT_SOURCE_DIR)
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_OUTPUT_DIR)
    parser.add_argument("--dpi", type=int, default=144)
    return parser.parse_args()


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8")
    args = parse_args()
    source_dir: Path = args.source_dir
    output_dir: Path = args.output_dir
    output_dir.mkdir(parents=True, exist_ok=True)

    if not source_dir.exists():
        raise FileNotFoundError(f"Missing source directory: {source_dir}")

    _, tessdata_dir = configure_tesseract()
    ocr_languages = available_languages(tessdata_dir)

    pdf_paths = sorted(source_dir.glob("*.pdf"))
    if not pdf_paths:
        raise FileNotFoundError(f"No PDF files found in: {source_dir}")

    records: list[dict[str, object]] = []
    for pdf_path in pdf_paths:
        print(f"[extract-practice-pdfs] processing {pdf_path.name}")
        records.append(extract_document(pdf_path, output_dir, args.dpi, ocr_languages, tessdata_dir))

    manifest = {
        "source_dir": str(source_dir),
        "output_dir": str(output_dir),
        "document_count": len(records),
        "ocr_languages": ocr_languages,
        "documents": records,
    }
    (output_dir / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    (output_dir / "README.md").write_text(build_index_markdown(records, output_dir), encoding="utf-8")

    print(f"[extract-practice-pdfs] done -> {output_dir}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
