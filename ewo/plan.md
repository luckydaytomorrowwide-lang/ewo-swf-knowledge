# PLAN工程（EWO設計）

PLAN工程では  
新しいEWOを設計する。

---

# 目的

新しいEWOを設計し  
実行可能な **EWO.json** を作成する。

---

# 入力

- 要求
- 変更目的
- 既存Workflow

---

# 参照順

設計の根拠が必要な場合、次の順序で参照する。

spec  
decisions  
examples  
templates  
checklists  

reference は必要な場合のみ参照する。

---

# 自律参照

PLAN工程では EWO設計の理解のために  
次の情報を **自律的に参照する。**

## examples

既存EWOの例

AIは examples を参照して  
EWO構造のパターンを理解する。

---

## sourceブランチ（実装）

workflow実装

source/ewo/source/activities  
source/ewo/source/workflows

AIは実装コードを参照し  
workflowが実際に何をしているか理解する。

---

# 作業

1 workflow構造を理解する  
2 workflowの処理内容を整理する  
3 EWO構造を設計する  
4 EWO.json を作成する  

### description の設計

EWO を生成する場合は、workflow が何を行うものかを判断し、
`description` にその概要を記載する前提で設計します。

description は workflow の目的・対象・主要な処理内容が分かる
簡潔な説明にします。

workflow 構造、入出力、主要ノード構成を根拠に
その workflow の役割を判断して記載します。

作業 と `spec/ewo-json-spec.md` の定義に不整合がある場合は、
生成を進めずアラートを上げます。

---

# 成果物

PLAN工程の成果物

- EWO.json

---

# 次工程

PLAN工程が完了したら  
DO工程へ進む。
