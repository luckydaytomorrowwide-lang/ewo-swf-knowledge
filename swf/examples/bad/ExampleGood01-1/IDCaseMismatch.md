# ExampleGood01-1: ID大小文字不一致によるSearchLineAC空振り

## 事象

SearchLineAC が 0件ヒットし、後続処理が空連鎖となった。

---

## 入力

```json
{
  "tableId": "node_deploy_01kjppbre77gs53wvm55snxwc7",
  "rootId": "01kjppbre77gs53wvm55snxwc7"
}

## 原因（観測ベース）

ID比較は完全一致

テーブル内IDは大文字

rootIdが小文字で渡された

## 結論

大小文字不一致により0件ヒットとなった。
正しくはテーブルIdは小文字(例:node_deploy_01kjppbre77gs53wvm55snxwc7)、テーブル内のrootIdは大文字(例:01KJPPBRE77GS53WVM55SNXWC7)で指定する。
現行実装として正しい挙動。

## 仕様改善項目

IDが大文字でも小文字でも正しく処理できるような対処について検討する。
