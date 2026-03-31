---
name: Pull Request
about: Standard PR template for PMTL_VN
---

## Loại thay đổi
<!-- Đánh dấu những gì phù hợp -->
- [ ] 🐛 Bug fix (không breaking change)
- [ ] ✨ Tính năng mới (không breaking change)
- [ ] 💥 Breaking change (fix/feature gây ảnh hưởng)
- [ ] 📚 Chỉ thay đổi docs
- [ ] 🛠 Infra/DevOps
- [ ] 🎨 Refactor (không thay đổi behavior)

## Mô tả
<!-- Mô tả ngắn những gì thay đổi và tại sao -->


## Checklist

### Bắt buộc
- [ ] Code đã chạy `pnpm lint` và `pnpm typecheck` pass
- [ ] Tests liên quan đã pass (`pnpm test`)
- [ ] Commit messages tuân theo conventional commits
- [ ] Self-review code của mình

### Nếu liên quan
- [ ] Đã cập nhật docs trong `design/` hoặc `docs/`
- [ ] Đã test manual trên môi trường dev
- [ ] Đã check accessibility (nếu UI changes)
- [ ] Đã verify Vietnamese text có đầy đủ dấu
- [ ] Migration script đã test rollback

### Security (nếu liên quan)
- [ ] Không hardcode secrets
- [ ] Input validation với Zod
- [ ] Auth/authz đã verify

## Screenshots (nếu UI)
<!-- Thêm screenshots nếu có UI changes -->

## Related Issues
<!-- Closes #123 -->
