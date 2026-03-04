テストレポート（case-002 / test-001）
1. 基本情報

対象：swf/test/case-002/test-001

実行ログ：log/ExampleTest02.log01.json

実行されたWorkflow：ExampleTest01 v1.0.0

correlationId：corr-mmbqllyp-1

実行結果ステータス：completed

status.json：ready_for_analysis

2. 入力条件

入力（Input）

tableId：baseinfo_deploy_01kjvw8rszctb7kkkkcy44nv9n

rootId：01KJVW8RSZCTB7KKKKCY44NV9N

3. 期待値

期待する出力キー：nameValue（EWO定義上の出力）

期待する値：テーブル上の該当データから取得される「name相当」の値

※期待値の具体値は testplan 側に記載する（本レポートではログ事実に集中）

4. 実行結果

Outputs

nameValue: 飯島愛

5. 中間ノード観察（ログからの事実）

時系列で主要ノードの入力・出力のみを抜粋。

SearchLineAC（parentId=rootId, nCat="anchor"）

結果：lineIds 3件

FirstRowAC（rows=上記lineIds）

結果：01KJVW8RT1MDHEHTXM0EQSGRRR

SearchLineAC_2（parentId=上記, nCat="anchor", key="sectionName"）

結果：lineIds 0件

FirstRowAC_2（rows=[]）

ログ：Empty array or invalid input

結果：null

SearchLineAC_3（uCat="field", parentId は undefined として実行）

ログ上の入力：parentId: undefined

SQLが WHERE u_cat = ? のみになり、結果：lineIds 7件

FirstRowAC_3

結果：01KJVW8RT54MV2X91PDZZ720X2

SearchLineAC_4（parentId=上記, key="value"）

結果：lineIds 1件（01KJVW8RT6EB1ZE8BKW4QXVYDS）

RetrieveColumnAC（lineId=上記, column="value"）

結果：columns 1件（"飯島愛"）

FirstRowAC_5

結果：飯島愛

6. 解析所見（事実ベース）

SearchLineAC_2 が 0件となり、その後 FirstRowAC_2 が null を返した。

その null が後続の SearchLineAC_3.parentId に渡り、ログ上は parentId: undefined として実行されている。

parentId が undefined のため、SearchLineAC_3 のSQL条件が u_cat = ? のみに簡略化され、7件ヒットしている。

最終的には RetrieveColumnAC(column="value") で "飯島愛" を取得し、workflowは completed で終了した。

7. 試験実施者所見

（記入欄）テスト意図／想定していた探索経路と、今回の実行経路の一致/不一致、次アクションなど。
