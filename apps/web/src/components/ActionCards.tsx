import Link from "next/link";
import { ArrowRightIcon, BookIcon, CompassIcon, UsersIcon } from "@/components/icons/ZenIcons";
import type { ActionCardItem } from "@/types/cms";
import { resolveIconToken } from "@/lib/ui-icons";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  book: BookIcon,
  compass: CompassIcon,
  users: UsersIcon,
};

interface ActionCardsProps {
  cards: ActionCardItem[];
}

export default function ActionCards({ cards }: ActionCardsProps) {
  return (
    <section className="section-shell">
      <div className="section-frame">
        <div className="section-intro">
          <p className="section-kicker">Lộ Trình Tu Học</p>
          <h2 className="section-title">
            Ba hướng đi rõ ràng, để người mới nhìn vào là biết nên bắt đầu từ đâu.
          </h2>
          <p className="section-copy">
            Mỗi khối dẫn tới một nhịp sử dụng khác nhau: học nền tảng, theo dõi lịch trình niệm, hoặc đi vào cộng đồng.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-12">
          {cards.map((card, index) => {
            const iconToken = resolveIconToken(card.icon) ?? card.iconType ?? null;
            const Icon = iconMap[String(iconToken ?? '').toLowerCase()] ?? BookIcon;
            const isPrimary = index === 0;

            return (
              <div
                key={card.title}
                className={isPrimary ? "lg:col-span-7" : "lg:col-span-5"}
              >
                <Link
                  href={card.link}
                  className={[
                    "panel-shell panel-hover group block h-full overflow-hidden p-7",
                    isPrimary ? "lg:min-h-[23rem]" : "lg:min-h-[18rem]",
                  ].join(" ")}
                >
                  <div className="card-stack justify-between gap-8">
                    <div className="space-y-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="icon-shell size-12">
                          <Icon className="h-7 w-7" />
                        </div>
                        <span className="card-eyebrow">
                          Lối vào 0{index + 1}
                        </span>
                      </div>

                      <div className="space-y-3">
                        <h3 className={isPrimary ? "ant-title text-4xl leading-tight text-foreground" : "ant-title text-3xl leading-tight text-foreground"}>
                          {card.title}
                        </h3>
                        <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
                          {card.description}
                        </p>
                      </div>
                    </div>

                    <div className="panel-divider flex items-center justify-between gap-4 pt-5">
                      <span className="text-sm text-muted-foreground">
                        {isPrimary ? "Dành cho người cần một điểm bắt đầu rõ ràng." : "Mở sang một nhóm nội dung chuyên biệt hơn."}
                      </span>
                      <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground transition-colors duration-200 group-hover:text-gold-dim">
                        Khám phá
                        <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
