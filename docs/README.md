# Документация SvelteKit Starter

Корневой [readme](../readme.md) описывает быстрый запуск и команды проверки.
Здесь собраны архитектурные правила, конфигурация и production-развёртывание.

## Архитектура

- [Обзор проекта](architecture/overview.md) — текущая структура каркаса
- [UI Architecture](architecture/ui.md) — границы слоёв, компонентов и состояния

## Разработка

- [Ant Design для Svelte 5](../src/lib/components/ant-design/readme.md) — компоненты,
  формы, темы и границы первой версии; примеры на `/ant-design`
- [Инструменты переноса Ant Design](reference/ant-design-porting/readme.md) —
  реестр покрытия, извлечение CSS и изолированные фикстуры
- [Политики проекта](policy/index.md) — правила изменения кода, тестов,
  зависимостей, сборки и документации

## Конфигурация и deployment

- [Конфигурация окружения](reference/configuration.md)
- [Развёртывание через systemd](deployment/systemd.md)
