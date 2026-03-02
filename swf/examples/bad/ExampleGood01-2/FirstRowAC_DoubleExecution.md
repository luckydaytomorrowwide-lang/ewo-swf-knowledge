
---

# 📁 `/swf/examples/bad/ExampleGood01-2/FirstRowAC_DoubleExecution.md`

```md
# ExampleGood01-2: FirstRowACが2回実行される

## 事象

FirstRowAC が2回実行される。

---

## 観測ログ

- ready=[FirstRowAC, FirstRowAC]
- FirstRowAC.cmd が2回Dispatch
- FirstRowAC.done が2回発火
- wf.completed が早期に発火

---

## 起きていること

- 同一IDのFirstRowACノードが2つ存在
- Coordinatorが2回スケジュール

---

## 影響

- payloadStore 上書き可能性
- doneイベント多重発火
- ワークフロー完了判定の早期化

---

## 結論

ノードID重複により多重実行が発生。
