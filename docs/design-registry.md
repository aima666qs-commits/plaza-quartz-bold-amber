# Реестр оформлений и репозиториев

Проверка звёзд: GitHub REST API `GET /repos/{owner}/{repo}`, 2026-09-09T15:43Z.

| Репозиторий | stargazers_count | Порог >100000 | Лицензия | checkedAt | Источник проверки |
| --- | ---: | --- | --- | --- | --- |
| shadcn-ui/ui | 123453 | да | MIT | 2026-09-09T15:43Z | GitHub API GET /repos/shadcn-ui/ui |
| twbs/bootstrap | 174752 | да | MIT | 2026-09-09T15:43Z | GitHub API GET /repos/twbs/bootstrap |
| ant-design/ant-design | не использован | нет на момент задания (~99.5k) | — | — | не берём |
| mui/material-ui | не использован | нет | — | — | не берём |
| tailwindlabs/tailwindcss | не использован как дизайн-источник | нет как дизайн-набор | MIT | — | техническая зависимость стека, не 31-й дизайн |

Основа реализации: TanStack Start + Tailwind v4 + собственные компоненты в духе shadcn (Radix уже в зависимостях). Bootstrap не установлен вторым UI-фреймворком: его примеры использованы как референс компоновки (B).

Адаптировано, не скопировано 1:1:

- S: sidebar, dashboard-01, cards, stepper, resizable two-pane, dialog/settings.
- B: cheatsheet/editorial, blog, album, checkout wizard, dashboard tables, starter one-column.

50 тем: см. `src/lib/themes/registry.ts`. Каждая имеет паспорт (семья, навигация, плотность, радиус, шрифты, токены). Комбинации светлый/тёмный/без анимаций не считаются отдельными дизайнами.
