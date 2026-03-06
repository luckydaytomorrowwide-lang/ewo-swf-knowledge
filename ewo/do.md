# DO工程（Workflow実行）

DO工程では  
PLAN工程で作成したEWOを **実行可能な状態にし、workflowを実行する。**

---

# 目的

workflowを実行し  
実行結果とログを取得する。

---

# 入力

PLAN工程の成果物

- EWO.json

---

# 作業

1 テストケースを作成する  
2 テスト資材を作成する  
3 workflowを実行する  
4 実行ログを取得する  

---

# テスト資材

テスト資材は **testブランチ**に保存する。

例

- EWO.json  
- Input.json  
- Table.json（必要な場合）

---

# 実行構造

workflow実装は **sourceブランチ**を参照する。

source/ewo/source/activities  
source/ewo/source/workflows

テスト資材は **testブランチ**を参照する。

test/case-xxx/test-xxx

---

# 成果物

DO工程の成果物

- EWO.json
- Input.json
- Table.json（必要な場合）
- 実行ログ

---

# 次工程

DO工程が完了したら  
CHECK工程へ進む。
