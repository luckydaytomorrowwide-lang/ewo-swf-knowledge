# Pull Request Template（PDCA接続強制版）

---

# 1. 変更種別（必須）

- [ ] spec
- [ ] decision（ADR）
- [ ] source（AC実装）
- [ ] test（Example / expected）
- [ ] template
- [ ] checklist

※ 複数選択可。ただし理由を明記すること。

---

# 2. Plan確認（必須）

## 2.1 参照したspec

- 関連spec：
  -

## 2.2 参照したdecisions

- 関連ADR：
  -

## 2.3 参照したexample / bad例

- 該当example：
  -
- 該当bad例：
  -

## 2.4 engine_version

- 使用engine_version：
  -

---

# 3. Do（実装内容）

## 3.1 変更内容

- 何を変更したか：
  -

## 3.2 変更理由

- なぜ必要だったか：
  -

---

# 4. Check（検証）

## 4.1 expected一致確認

- [ ] expected.json一致確認済

## 4.2 ログ確認

- [ ] ログ確認済

## 4.3 静的検証

- [ ] ID重複なし
- [ ] 依存関係問題なし

## 4.4 テスト結果

- 結果概要：
  -

---

# 5. Act（改善）

## 5.1 原因分類（該当するもの）

- [ ] 実装バグ
- [ ] 仕様不足
- [ ] 再現資材不備
- [ ] 設計問題
- [ ] その他

## 5.2 再発防止策

- 今回の学習：
  -

## 5.3 decision昇格の要否

- [ ] ADR発行済
- [ ] 不要（理由を記載）

理由：
-

---

# 6. 影響範囲

- sourceへの影響：
- testへの影響：
- knowledgeへの影響：

---

# 7. 完了条件確認

- [ ] mainへ直接コミットしていない
- [ ] 1判断＝1ADRを守っている
- [ ] specに議論を書いていない
- [ ] 参照順を守っている（spec → decisions → examples → templates → checklists）

---

# 8. 補足

必要があれば記載する。
