# Repository Structure

このドキュメントは
EWO Factory のリポジトリ構造を定義する。

---

# Branch Structure

このリポジトリは次の3つのブランチで構成する。

main
source
test

---

# main ブランチ

main ブランチは
EWO Factory の **仕様・運用情報（SSOT）** を管理する。

構造

ewo/

spec
decisions
examples
templates
checklists
manifest
docs

---

# source ブランチ

source ブランチは
EWO生成に使用する **実装資産** を管理する。

構造

ewo/source/

activities
workflows

これらは **EWO実装の正本**である。

---

# test ブランチ

test ブランチは
EWO実行の **テストケース** を管理する。

構造

test/

case-xxx/
test-xxx/

例

test/case-001/test-001/

各 test ディレクトリには
当該テストで使用する資材一式を保存する。
