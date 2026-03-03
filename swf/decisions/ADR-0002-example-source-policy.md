# ADR-0002: Example と Implementation の責務分離ポリシー（branch-based）

## Status
Accepted

---

## Context

ExampleGood01 はテスト資材（ewo.json / Input / table）を含む。
一方、EWO が参照する実装（source）は別責務であり、Example と混在すると再現性と変更追跡が崩れる。

本プロジェクトは「再現性の確保」を最優先とし、PDCAに基づく改善をナレッジとして蓄積する必要がある。

---

## Decision

### 1) Example（test資材）は main ブランチで管理する
Example に置くもの（再現入力）：

- ewo.json（正常動作確認済みのみ）
- Input.json
- table.json / table.xlsx
- expected（将来追加）

Example に置かないもの：

- 実装 source 一式
- 実行ログ等の環境依存成果物
- 試行錯誤版（失敗版）

配置：

- `swf/test/examples/good/<ExampleName>/...`
- `swf/test/examples/bad/<ExampleName>/...`

---

### 2) Implementation（実装）は source ブランチで管理する
実装は `source` ブランチのみに配置し、責務を分離する。

配置：

- branch: `source`
- path: `swf/source/`

---

### 3) Baseline は両者の接続点とする
再現性の固定点は `swf/manifest/baseline.md` とし、最低限以下を明記する：

- Implementation の branch / path（本ADRで固定：source / swf/source）
- 保証対象 Example（例：ExampleGood01）
- （可能なら）tag / commit での固定

---

## Consequences

- Example（再現入力）と Implementation（実装）が混在しない
- baseline が「いまの正」を一箇所で示せる
- 運用者が増えても同じルールでPDCAを回せる

---

このADRは、Example運用の混乱と再発を防止するための決定である。
