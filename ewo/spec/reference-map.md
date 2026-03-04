# Reference Map

このドキュメントは
EWO Factory の参照関係（何をどの順で参照するか）と、各領域の役割を定義する。

---

# 参照順（必須）

作業者およびAIは次の順序で参照する。

1. spec
2. decisions
3. examples
4. templates
5. checklists

spec が最優先である。

---

# 構造図（全体）

EWO Factory の全体構造は次の通り。

```
           ┌──────────────┐
           │   spec (SSOT) │  仕様・運用の正本
           └──────┬───────┘
                  │ 参照（ルール）
                  v
           ┌──────────────┐
           │ decisions     │  判断理由（ADR）
           └──────┬───────┘
                  │ 参照（根拠）
                  v
┌──────────────────────────────┐
│ examples (knowledge)          │  実績のあるEWO例（参考）
│  - good : 良い例              │
│  - bad  : 悪い例              │
└──────────────┬───────────────┘
               │ 参照（設計の参考）
               v
      ┌─────────────────┐
      │ templates         │  定型化（作業/生成テンプレ）
      └────────┬────────┘
               │ 参照（確認）
               v
      ┌─────────────────┐
      │ checklists        │  抜け漏れ防止
      └─────────────────┘

--------------------------------------------

実行系（DO/CHECKで使用）

┌───────────────────────────────────────────┐
│ source (implementation)                    │  実装の正本（別ブランチ）
│  - ewo/source/activities                   │
│  - ewo/source/workflows                    │
└──────────────┬────────────────────────────┘
               │ 実行（workflow running）
               v
┌───────────────────────────────────────────┐
│ test (execution set)                       │  再現実行の資材一式
│  test/case-xxx/test-xxx/                   │
│   - EWO.json  (PLAN成果物)                 │
│   - Layout.json                            │
│   - Data.json                              │
│   - Template.json                          │
│   - その他資材                             │
└───────────────────────────────────────────┘
```

---

# 領域別の役割（定義）

## spec（SSOT）

* 仕様と運用ルールの正本
* PDCA工程の定義
* テスト構造・リポジトリ構造の定義

---

## decisions

* 仕様 / 運用 / 設計の判断理由（ADR）
* 変更の背景と採用理由を残す

---

## examples（knowledge）

* 実績のあるEWOの例（参考用）
* EWO生成時の参考にする

構造

```
examples/
  good/
  bad/
```

---

## templates

* 作業や生成の型（テンプレート）
* PRテンプレート
* 手順テンプレート

---

## checklists

* 作業の抜け漏れ防止
* 作業開始前 / 完了前の確認項目

---

## source（implementation）

実装の正本（sourceブランチ）

```
ewo/source/
  activities/
  workflows/
```

---

## test（execution set）

再現実行の資材一式

```
test/
  case-xxx/
    test-xxx/
```

例

```
test/case-001/test-001/
```

内容

* EWO.json
* Layout.json
* Data.json
* Template.json
* その他必要資材

---

# 注意（混同禁止）

* examples は **参考知識**
* test は **再現実行**
* 実装の正本は **sourceブランチ**
