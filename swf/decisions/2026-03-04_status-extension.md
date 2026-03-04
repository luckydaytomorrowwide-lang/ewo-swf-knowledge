# Decision: ステータス拡張（pending追加）

## 決定日
2026-03-04

## 決定内容

status.json の状態を以下の4種類とする。

- ready_for_run
- ready_for_analysis
- pending
- done

## 背景

- PASS/FAILの二択では表現できない状態が発生。
- 判定基準未確定ケースが存在した。

## 他の選択肢

- PASS/FAILのみで管理する。
- 状態管理を廃止する。

## 採用理由

- 判定未確定状態を健全に管理できる。
- 無理なFAIL宣言を避けられる。

## 今後の判断基準

- 判定基準未確定時は pending を使用する。
