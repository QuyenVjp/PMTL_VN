# Publish Life Release Guide

## Purpose

- publish hoặc cập nhật một guide `Phóng Sanh` theo đúng content boundary, typed blocks và review notes

## Owner module

- `02-content`

## Actors

- `admin`
- `super-admin`

## Trigger

- biên tập viên publish:
  - hub `Phóng Sanh`
  - guide detail
  - ritual variant
  - FAQ / download companion

## Preconditions

- actor có quyền editorial
- guide có `slug`
- guide có `sourceReference`
- nếu có species-specific counts hoặc wording khấn nhạy cảm thì phải có `reviewNote`

## Input contract

- `title`
- `slug`
- `group`
- `summary`
- `typedBlocks`
- `sourceReference`
- `reviewNote?`
- `versionNote?`
- `linkedVariantKeys?`
- `downloadRefs?`
- `status`

## Write path

1. validate role
2. validate slug uniqueness
3. validate typed blocks:
   - `step_sequence`
   - `script_block`
   - `warning_list`
   - `ritual_variant`
   - `species_count_matrix`
4. ensure source/reference fields tồn tại
5. nếu publish:
   - set `publishedAt`
   - append audit
6. emit downstream revalidation/search sync signal theo policy

## Success result

- guide được public hóa đúng route
- FE có đủ DTO cho hub, detail page, companion panel và member journal bridge

## Errors

- `400`: typed blocks sai hoặc thiếu `sourceReference`
- `401`: chưa đăng nhập
- `403`: không đủ quyền
- `404`: relation/download ref không tồn tại
- `409`: slug conflict hoặc state conflict
- `500`: publish/revalidation/audit fail

## Notes for AI/codegen

- `Phóng Sanh` là content-first surface, không được đặt canonical script vào `vows-merit`
- admin workspace phải validate typed blocks trước khi publish, không publish raw editor payload
