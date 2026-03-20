---
markmap:
  colorFreezeLevel: 2
  initialExpandLevel: 3
---

# Student VPS Production Roadmap

## Mục tiêu của file này

### File này dành cho ai

- Dành cho người đang:
  - code local là chính
  - mới deploy VPS được ít lâu
  - phải tự ôm cả code, deploy, vận hành, debug, bảo trì

### File này dùng để làm gì

- Giúp anh nhìn production theo kiểu senior:
  - không đoán mò
  - không chỉ học từng lệnh rời rạc
  - biết thứ tự ưu tiên
  - biết lúc nào cần học cái gì trước

### Triết lý học đúng

- Đừng học production theo kiểu:
  - cài thật nhiều tool
  - copy infra của công ty lớn
  - CI/CD trước khi biết deploy tay
- Học theo thứ tự:
  - hiểu hệ đang chạy
  - biết nhìn lỗi
  - biết deploy an toàn
  - biết rollback
  - biết backup và restore
  - biết tối ưu dần

## Bức tranh tổng thể

### 4 trục anh đang thiếu và phải học song song

#### 1. Code và kiến trúc

- Biết module nào sở hữu dữ liệu nào
- Biết side effect nào phải async
- Biết boundary nào phải validate
- Biết vì sao code local chạy được nhưng production vẫn chết

#### 2. Deploy và CI/CD

- Biết cách từ code mới đi ra production
- Biết cách giữ bản cũ để rollback
- Biết cách validate trước và sau deploy

#### 3. Debug và monitoring

- Biết hệ đang sống hay chết ở đâu
- Biết xem logs, metrics, health checks
- Biết phân biệt:
  - lỗi app
  - lỗi infra
  - lỗi data
  - lỗi config

#### 4. Vận hành VPS / production

- Biết SSH, Linux cơ bản, disk, RAM, CPU
- Biết Docker Compose thật sự làm gì
- Biết backup
- Biết restore
- Biết runbook khi có sự cố

### Cách senior nhìn một hệ thống

- Senior không chỉ hỏi:
  - code đúng chưa?
- Senior còn hỏi:
  - chết thì ai phát hiện?
  - phát hiện xong nhìn vào đâu?
  - rollback trong bao lâu?
  - backup có restore được không?
  - event async có bị rơi không?
  - file upload có mất khi deploy không?
  - env sai thì fail sớm hay chết muộn?

## Phase 0. Tư duy gốc phải nắm trước

### Production khác local ở đâu

- Local:
  - anh control gần như mọi thứ
  - restart tay dễ
  - dữ liệu không quá quan trọng
- Production:
  - có người dùng thật
  - có dữ liệu thật
  - có lỗi ngẫu nhiên
  - có network issue
  - có disk đầy
  - có queue backlog
  - có deploy fail giữa chừng

### 5 câu hỏi gốc trước mọi thay đổi

- Cái gì là source of truth?
- Cái gì chỉ là cache / projection / queue state?
- Nếu dependency chết thì flow này `continue`, `degrade`, hay `fail closed`?
- Nếu deploy hỏng thì quay lui thế nào?
- Nếu dữ liệu lệch thì recovery path là gì?

### Với PMTL_VN thì câu trả lời nền tảng là gì

- Postgres là source of truth
- Valkey chỉ là cache / execution queue / rate-limit coordination
- Meilisearch chỉ là search projection
- NestJS auth là auth authority duy nhất
- Side effect quan trọng đi theo:
  - canonical write
  - outbox
  - dispatcher
  - execution queue
  - worker

## Phase 1. Nắm chắc VPS đang chạy

### Mục tiêu phase này

- Không còn cảm giác “VPS là hộp đen”
- Biết hệ đang chạy cái gì, ở đâu, chết ra sao

### 1. SSH và Linux cơ bản

#### Phải biết các lệnh tối thiểu

- `pwd`
- `cd`
- `ls -lah`
- `cat`
- `tail -f`
- `ps aux`
- `top` hoặc `htop`
- `df -h`
- `free -h`
- `du -sh`
- `ss -lntp`
- `journalctl` nếu có service systemd

#### Phải hiểu các tài nguyên thật

- CPU dùng để làm gì
- RAM dùng để làm gì
- disk đầy thì chuyện gì xảy ra
- swap có ý nghĩa gì
- port nào đang mở
- process nào ăn RAM/CPU

#### Sai lầm sinh viên hay gặp

- chỉ biết `ls`
- không biết log nằm đâu
- không biết disk đã đầy
- không biết process chết từ bao giờ

### 2. Docker Compose ops cơ bản

#### Phải biết

- `docker compose ps`
- `docker compose logs -f`
- `docker compose up -d`
- `docker compose down`
- `docker compose restart`
- `docker compose exec <service> sh`
- `docker stats`
- `docker images`
- `docker volume ls`

#### Phải hiểu thật

- container không phải VM
- restart container không phải fix mọi thứ
- image khác container
- volume khác filesystem trong container
- env file đổi nhưng chưa recreate container thì app có thể vẫn chạy config cũ

#### Câu hỏi phải tự trả lời được

- web đang ở container nào?
- api ở container nào?
- worker ở container nào?
- Postgres/Valkey/Meili ở đâu?
- data đang nằm trong volume nào?

### 3. Health check thủ công

#### Phải biết kiểm tra

- web:
  - `curl /health/live`
  - `curl /health/ready`
- Postgres:
  - `pg_isready`
- Valkey:
  - `redis-cli ping` hoặc tool tương đương
- Meilisearch:
  - `/health`

#### Ý nghĩa thật

- `live`:
  - process còn sống không
- `ready`:
  - service đã sẵn sàng phục vụ chưa
- `startup`:
  - boot có hoàn thành chưa

#### Điều senior làm

- không tin “container up” là đủ
- phải phân biệt:
  - process còn sống
  - dependency đã sẵn sàng
  - route thật đã trả đúng

## Phase 2. Nhìn thấy hệ thống khi có lỗi

### Mục tiêu phase này

- Có lỗi thì không panic
- Biết nhìn từ ngoài vào trong

### 1. Logs

#### Phải hiểu log tốt là gì

- có timestamp
- có level:
  - info
  - warn
  - error
- có context:
  - request id
  - user id nếu có
  - module name
  - action name

#### Với PMTL_VN nên nhìn log thế nào

- Pino structured logs
- log theo JSON
- lọc bằng:
  - `jq`
  - `rg`
  - `Select-String`

#### Log nên giúp trả lời

- request nào fail
- module nào fail
- dependency nào fail
- payload nào fail validation
- job nào fail retry

### 2. Metrics

#### Tại sao metrics quan trọng

- Log cho biết “đã có lỗi gì”
- Metrics cho biết:
  - lỗi tăng từ khi nào
  - latency tăng chưa
  - queue backlog ra sao
  - CPU/RAM/disk có bất thường không

#### Những metric phải biết trước

- request count
- error count
- request latency
- queue length
- job fail count
- outbox pending count
- rate limit hit count
- upload fail count

#### Dashboard đầu tiên nên có

- app health
- host CPU/RAM/disk
- Postgres health
- Valkey health
- Meilisearch health
- queue / worker health

### 3. Alerting

#### Alert đầu tiên không cần nhiều

- DB down
- disk gần đầy
- app error rate tăng mạnh
- queue backlog quá lớn
- health endpoint fail

#### Sai lầm hay gặp

- chưa hiểu metric đã alert
- alert quá nhiều gây mù
- alert không có runbook đi kèm

### 4. Debug flow chuẩn khi production lỗi

#### Flow senior thường đi

- alert kêu hoặc user báo lỗi
- xác định scope:
  - một route
  - một module
  - cả hệ
- xem health
- xem dashboard
- tail logs
- xác định dependency nào fail
- fix nhỏ nhất có thể
- verify sau fix
- ghi incident note

#### Không nên làm

- vừa thấy lỗi là sửa code ngay
- restart toàn bộ stack khi chưa hiểu lỗi
- deploy nóng thêm lỗi mới

## Phase 3. Deploy an toàn trước, CI/CD sau

### Mục tiêu phase này

- Deploy tay nhưng chắc
- Sau đó mới tự động hóa

### 1. Deploy thủ công chuẩn

#### Một quy trình đơn giản nhưng đúng

- pull code
- kiểm tra branch / version
- build image hoặc build app
- migrate nếu có
- `docker compose up -d`
- check health
- check logs
- click thử flow quan trọng

#### Những gì phải có trước deploy

- biết version hiện tại
- biết env hiện tại
- biết rollback về bản nào
- biết migration nào có rủi ro

### 2. Rollback strategy

#### Rollback không phải “hy vọng”

- phải giữ image cũ hoặc tag cũ
- phải biết config cũ
- phải biết migration có reversible không

#### Phân loại rollback

- rollback app only
- rollback app + worker
- rollback app nhưng giữ DB schema mới
- rollback DB là nguy hiểm nhất, không phải lúc nào cũng làm được

### 3. CI/CD sau khi hiểu deploy tay

#### Khi nào mới nên làm CI/CD

- khi anh deploy tay đã ổn
- khi biết health check sau deploy
- khi biết rollback
- khi test tối thiểu đã có

#### GitHub Actions nên làm gì trước

- lint
- test
- build
- tạo artifact / image
- SSH deploy hoặc pull image

#### Đừng làm quá sớm

- auto deploy mọi commit lên production
- không có approval step
- không có post-deploy verification

### 4. Env và secrets

#### Phải hiểu rõ

- `.env` không commit git
- secret không hardcode
- secret đổi thì service nào phải restart
- env sai phải fail fast khi boot

#### Những secret thường có

- DB URL
- app secret
- Meili key
- SMTP key
- Cloudflare / R2 key
- GitHub Actions secret

## Phase 4. Code và kiến trúc kiểu production

### Mục tiêu phase này

- Không chỉ code chạy được
- Code phải sống được ngoài production

### 1. Boundary validation

#### Mọi boundary phải validate

- request body
- params
- query
- env
- queue payload
- webhook payload
- search document

#### Vì sao senior ép validate

- TypeScript không bảo vệ runtime
- lỗi production hay đến từ:
  - env thiếu
  - payload lệch version
  - client gửi rác
  - worker nhận payload cũ

### 2. Async reliability

#### Vì sao không được “ghi DB rồi bắn job luôn”

- DB commit xong
- queue push fail
- data canonical đúng nhưng projection downstream sai

#### Pattern đúng cần học

- write canonical
- append outbox trong cùng transaction
- dispatcher đọc outbox
- queue nhận execution job
- worker xử lý idempotent

#### Đây là thứ phân biệt local dev với production thinking

- local hay nghĩ “chạy được là xong”
- production phải nghĩ “mất event thì sao”

### 3. Logging và audit

#### Structured logging

- để debug
- để correlate request và job

#### Audit log

- để điều tra hành động quan trọng
- ví dụ:
  - login/logout
  - publish post
  - delete comment
  - admin action
  - role change

### 4. Feature flags

#### Tại sao senior thích

- rollout từ từ
- tắt feature khi có sự cố
- test trên production an toàn hơn

#### Đừng lạm dụng

- feature flag không phải config rác
- phải có owner và mục đích rõ

## Phase 5. Vận hành dài hạn

### Mục tiêu phase này

- Phòng bệnh hơn chữa bệnh
- Không để mỗi lần lỗi là một lần hoảng loạn

### 1. Backup + restore

#### Backup mà không restore thử thì chưa đáng tin

- phải backup DB định kỳ
- phải backup volume/file nếu cần
- phải test restore

#### Bài học senior nào cũng biết

- backup fail còn đỡ
- backup tưởng tốt nhưng restore không được mới là thảm họa

### 2. Capacity planning

#### Phải theo dõi trend

- disk dùng tăng thế nào
- RAM có bị ăn dần không
- CPU peak lúc nào
- DB connections có tăng dần không
- queue backlog có tăng theo traffic không

#### Không cần enterprise mới làm

- 1 VPS càng phải làm
- vì hết tài nguyên là chết thật

### 3. Runbook + incident log

#### Runbook là gì

- tài liệu trả lời:
  - lỗi này nhìn ở đâu
  - kiểm tra gì trước
  - restart gì
  - rollback thế nào
  - ai cần biết

#### Incident log là gì

- mỗi lần có sự cố:
  - ghi thời gian
  - triệu chứng
  - nguyên nhân
  - fix
  - bài học

#### Đây là cách một người tự học nhanh hơn

- không lặp lại cùng một lỗi 5 lần

## Lộ trình học thực tế cho anh

### 2 tuần đầu

- nắm SSH và Linux cơ bản
- nắm Docker Compose ops
- tự check health thủ công
- biết đọc logs của từng service

### 2 đến 6 tuần

- dựng dashboard tối thiểu
- thêm metrics và alert cơ bản
- chuẩn hóa deploy tay
- chuẩn hóa rollback
- viết vài runbook ngắn

### 6 đến 12 tuần

- thêm CI/CD an toàn
- thêm outbox và queue reliability
- thêm audit log
- thêm feature flags
- thêm backup + restore test

### Sau đó mới tối ưu sâu

- traces
- CDN / edge tuning
- object storage migration
- semantic search
- capacity planning bài bản

## Checklist năng lực anh nên tự đánh giá

### VPS / production

- Anh có SSH vào server và tự kiểm tra host health được không?
- Anh có biết disk gần đầy nhìn ở đâu không?
- Anh có biết container nào đang chết không?

### Debug / monitoring

- Anh có biết route fail nằm ở web, api, worker hay DB không?
- Anh có dashboard đầu tiên chưa?
- Anh có biết đọc structured logs chưa?

### Deploy / CI/CD

- Anh có rollback được về bản trước không?
- Anh có phân biệt image, container, volume, env chưa?
- Anh có deploy tay chắc chưa, hay vẫn làm theo cảm giác?

### Code / kiến trúc

- Anh có phân biệt canonical data với cache / search / queue state chưa?
- Anh có hiểu outbox và idempotency chưa?
- Anh có validate boundary thật ở runtime chưa?

## Những sai lầm người mới gần như luôn gặp

### Sai về vận hành

- không backup
- backup nhưng không test restore
- disk đầy mới biết
- restart bừa mọi thứ

### Sai về deploy

- deploy thẳng lên production mà không check health
- sửa env nhưng quên recreate service
- không giữ version cũ để rollback

### Sai về code

- tin TypeScript là đủ
- bắn async side effect trực tiếp từ request
- dùng cache như source of truth
- thiếu idempotency cho worker

### Sai về học

- học tool trước, quên học tư duy
- thích infra “xịn” quá sớm
- chạy theo stack enterprise khi chưa nắm stack nhỏ

## PMTL_VN nên ưu tiên học gì ngay

### Ưu tiên số 1

- hiểu VPS và Docker Compose đang chạy gì

### Ưu tiên số 2

- biết debug production bằng health + logs + metrics

### Ưu tiên số 3

- biết deploy tay an toàn và rollback

### Ưu tiên số 4

- biết code theo production thinking:
  - outbox
  - validation
  - audit
  - idempotency

### Ưu tiên số 5

- biết vận hành dài hạn:
  - backup
  - restore
  - runbook
  - incident log

## Kết luận ngắn

### Nếu chỉ nhớ 1 câu

- Production không phải là “server đang chạy”.
- Production là:
  - biết hệ đang sống thế nào
  - biết lỗi ở đâu
  - biết deploy an toàn
  - biết quay lui
  - biết phục hồi dữ liệu

### Nếu chỉ nhớ 1 roadmap

- hiểu hệ đang chạy
- nhìn thấy hệ khi có lỗi
- deploy tay an toàn
- tự động hóa sau
- vận hành dài hạn bằng backup, runbook, incident log
