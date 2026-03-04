# Test Structure

EWO Factory のテストケース構造を定義する。

## ディレクトリ構造

テストケースは次の構造で管理する。

test/

case-xxx/
test-xxx/

例

test/
case-001/
test-001/

---

## テスト資材

各 test ディレクトリには  
そのテストで使用する資材一式を保存する。

例

test/case-001/test-001/

EWO.json  
Layout.json  
Data.json  
Template.json  
その他必要資材

---

## EWO.json

EWO.json は  
PLAN工程で作成する成果物である。

このファイルは  
workflow実行の定義を持つ。

---

## テストの目的

test ディレクトリは

EWO実行の再現テストを行うためのものである。
