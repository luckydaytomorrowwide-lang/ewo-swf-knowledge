# EWO Knowledge

このディレクトリは **EWO Workflow の知識ベース（SSOT）**です。

EWO生成・実行・解析・改善を  
**再現可能なプロセスとして実行するための情報**を格納します。

AIおよび作業者は、このリポジトリを根拠として作業を行います。  
推測で判断してはいけません。

---

# チャット開始時の手順（Chat Intake）

チャット開始時は次の手順で作業します。

1 依頼内容を理解する  
2 質問タイプを判定する  
3 作業工程を決定する  
4 工程ガイドを参照する  

---

# 質問タイプ

依頼内容を次の質問タイプに分類します。

|質問タイプ|内容|
|---|---|
構造理解|workflowやEWOの説明|
生成|新しいEWO作成|
実行|workflow実行|
解析|結果やログ解析|
改善|修正や改善|

---

# 工程判定

質問タイプから工程を決定します。

|質問タイプ|工程|
|---|---|
構造理解|PLAN|
生成|PLAN|
実行|DO|
解析|CHECK|
改善|ACTION|

---

# 工程ガイド

工程に応じて次のファイルを参照します。

|工程|参照ファイル|
|---|---|
PLAN|plan.md|
DO|do.md|
CHECK|check.md|
ACTION|action.md|

---

# GitHub参照順

回答や判断の根拠を探す場合は  
次の順序でGitHubを参照します。

spec  
decisions  
examples  
templates  
checklists  

reference は必要な場合のみ参照します。

spec が最優先です。

---

# ディレクトリの役割

## spec

EWO作成の仕様です。  
ここに書かれている内容は **正（SSOT）** とみなします。

例

- SWF構造
- JSON構造
- workflow仕様

---

## decisions

設計上の決定事項を記録します。

仕様の背景や、過去の設計判断を理解するための資料です。

---

## examples

正しいEWO例を格納します。

AIが構造を理解したり、新しいEWOを作成するときの参考になります。

---

## templates

生成時に利用するテンプレートです。

例

- JSONテンプレート
- workflowテンプレート

---

## checklists

作業時の確認項目です。

例

- SWF作成チェック
- JSON検証チェック

---

## reference

EWOに関する参考資料を格納します。

これらは正式仕様ではありません。

- 古い可能性があります  
- 実装と一致しない可能性があります  
- 不完全な可能性があります  

AIは **必要に応じて参照します。**

---

# 実装参照

workflow実装は **sourceブランチ**を参照します。

source/ewo/source/activities  
source/ewo/source/workflows

---

# 実行資材

workflow実行資材は **testブランチ**を参照します。

test/case-xxx/test-xxx

---

# Repository Policy

このリポジトリでは次を基本ルールとします。

- mainブランチへ直接変更しない
- 変更はPRで反映する
- 設計判断は decisions に記録する

---

# Goal

このリポジトリの目的は

**EWO Workflow の生成・検証・実行を再現可能なプロセスとして固定すること**

です。
