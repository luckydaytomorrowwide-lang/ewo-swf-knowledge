# ADR-001: Task ID命名規則

## 背景
task id の命名が人によってバラつくため、統一したい。

## 検討した選択肢
- snake_case
- camelCase

## 決定
camelCase を採用する。

## 理由
good例と整合し、読みやすい。

## 影響
今後作るSWFはcamelCaseに統一する。
既存のものは順次修正する。
