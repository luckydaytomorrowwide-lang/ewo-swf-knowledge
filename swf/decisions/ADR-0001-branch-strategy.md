# ADR-0001: Branch Strategy Definition

## Status
Accepted

---

## Context

SWF生成プロセスを再現可能にするためには、
構造変更・仕様変更・実装変更が混在してはならない。

mainブランチは常に安定状態を保つ必要がある。

---

## Decision

本プロジェクトでは以下のブランチ戦略を採用する。

### 1. main

- 常に安定状態
- 動作保証済みのみ
- 直接コミット禁止（例外：初期構造構築のみ）

---

### 2. feature/*

用途：
- 新機能追加
- SWF生成ロジック変更
- テンプレ追加

例：
feature/add-data-import-swf

---

### 3. fix/*

用途：
- バグ修正
- テスト失敗修正

例：
fix/header-parse-error

---

### 4. refactor/*

用途：
- 構造改善
- ロジック整理
- 振る舞いを変えない改善

---

### 5. docs/*

用途：
- spec修正
- ADR追加
- テンプレ更新
- checklist更新

---

## Pull Request Rules

- 1目的＝1PR
- 1判断＝1ADR
- spec変更と実装修正は分離可能な限り分離
- PRテンプレ必須

---

## Consequences

この戦略により：

- 変更理由が明確になる
- 改善履歴が追跡可能になる
- PDCAが構造的に回る

---

Branch戦略はPDCAを守るための構造である。
