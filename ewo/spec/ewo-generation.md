# EWO Generation Specification

このドキュメントは
EWO生成の基本仕様を定義する。

---

# EWO生成の位置づけ

EWO生成は **PLAN工程**で行う。

PLAN工程では
新しい **EWO.json** を作成する。

---

# examples

examples は  
実績のある EWO の例を保存するディレクトリである。

EWO生成時の参考として使用する。

---

## ディレクトリ構造

examples は次の構造で管理する。

examples/

good/  
bad/

---

## good

実績のある良いEWOの例。

EWO生成時の参考として使用する。

---

## bad

問題のあるEWOの例。

失敗例として  
EWO生成時の参考にする。

---

# EWO生成の成果物

EWO生成の成果物は次である。

* EWO.json

EWO.json は
workflow実行の定義を持つ。

---

# 実行（DO工程）

EWO.json に基づき
workflow を実行する。

workflow 実装は
sourceブランチを参照する。

```
source / ewo / source / activities
source / ewo / source / workflows
```

これらが実装の正本である。

---

# テストケース

EWO生成は
テストケースとともに作成する。

テスト資材は次の構造で管理する。

```
test/
  case-xxx/
    test-xxx/
```

例

```
test/case-001/test-001/
```

このディレクトリには
当該テストで使用する資材一式を保存する。

例

* EWO.json
* Layout.json
* Data.json
* Template.json
* その他必要資材

---

# 情報不足時

ユーザー依頼だけでは
EWO生成内容が確定できない場合

推測で補完してはならない。

不足情報を質問して確定する。
