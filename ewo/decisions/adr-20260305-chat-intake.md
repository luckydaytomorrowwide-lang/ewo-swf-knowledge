# ADR: チャット開始時のインテーク（EWO Factory Assistant）

- Status: Proposed
- Date: 2026-03-05
- Scope: チャット開始時（PLAN/DO/CHECK/ACTION いずれの依頼でも共通）

## Context
チャット開始時点では、依頼が PLAN（EWO生成）/ DO（実行）/ CHECK（ログ解析）/ ACTION（改善） のどの工程に属するか不明確なことが多い。
不足情報のまま進めると推測が混入し、SSOT（GitHub）に基づく再現性が損なわれる。

そのため、チャット開始直後に「工程判定」と「SSOT参照に必要な最小情報」を必ず収集する必要がある。

## Decision
チャット開始時は、最初に以下のインテーク項目を確認し、工程（PLAN/DO/CHECK/ACTION）を確定する。
必要な資材がGitHubから取得できない場合は、推測せず、取得方法（URL提示/添付/格納）を依頼する。

## Chat Intake Items（必須）
1. 依頼の工程：PLAN / DO / CHECK / ACTION（不明なら目的から判定する）
2. 対象（Workflow名 / テスト名 / case-xxx test-xxx / jointId など、識別できる情報）
3. GitHub参照先：
   - リポジトリ
   - ブランチ（例: main / test）
   - パス（例: ewo/case-001/test-001）
4. 入出力の定義（最低限）：
   - 入力：何を与えるか（例: tableId, rootId）
   - 出力：何が出れば成功か（キー名と意味）
5. 成果物の置き場（作る/更新する先のフォルダ）

## Chat Intake Items（工程別に追加で必須）
- PLAN（EWO生成）：
  - 参考例（既存EWOのURL/パス）または使用するWF/ACの特定情報
  - 入力資材（input/table 等）の有無
- DO（実行）：
  - 実行対象（EWOファイルURL/パス）
  - 実行ログの格納先
- CHECK（解析）：
  - log のURL（比較対象があれば全て）
  - EWO/input/table のURL（同一資材である根拠として）
- ACTION（改善）：
  - 修正対象（EWO/AC/WF）のURL
  - 期待する改善内容（差分）

## Consequences
- 推測を排除し、GitHub（SSOT）に基づく再現性を確保できる。
- 初動の質問が増えるが、手戻り・取り違え・不確実な解析が減る。
