# Развёртывание через systemd

> Type: Reference. Production-запуск SvelteKit Starter через systemd.

Приложение использует `@sveltejs/adapter-node`: production-сервер запускает
собранный каталог `build` через Node.js. `npm run preview` предназначен только
для локальной проверки сборки.

## Подготовка

Для установки, проверок и сборки используйте Node.js 20 от версии 20.19,
Node.js 22 от версии 22.12 либо Node.js 24 или новее. Эти ограничения следуют
из `engines.node` текущих Vite, Svelte Vite plugin и Oxlint в `package-lock.json`.

В примере приложение находится в `/home/app/sveltekit-starter` и запускается от
существующего пользователя `app`. Замените пользователя, пути и внешний origin
на значения своего сервера.

Создайте `/home/app/sveltekit-starter/.env` по образцу `.env.example` и задайте
runtime-параметры adapter-node:

```dotenv
NODE_ENV=production
HOST=0.0.0.0
PORT=5173
ORIGIN=http://localhost:5173
```

Установите зависимости и соберите приложение:

```bash
cd /home/app/sveltekit-starter
npm ci
npm run build
```

Для сборки каркаса переменные окружения не требуются. Перечисленные версии
Node.js поддерживают запуск с `--env-file`. Узнать путь к Node.js можно командой:

```bash
command -v node
```

## Сервис

Создайте unit-файл `/etc/systemd/system/sveltekit-starter.service`:

```ini
[Unit]
Description=SvelteKit Starter
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=app
Group=app
WorkingDirectory=/home/app/sveltekit-starter
ExecStart=/usr/bin/node --env-file=/home/app/sveltekit-starter/.env /home/app/sveltekit-starter/build
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Если `command -v node` вернул другой путь, замените `/usr/bin/node` в `ExecStart`.

Не используйте `EnvironmentFile` и `Environment=` для настроек приложения.
На системе с SELinux в режиме Enforcing systemd может не получить доступ к
`.env` с меткой `user_home_t`. В этом варианте файл читает Node-процесс,
запущенный от имени `app`.

Запустите сервис:

```bash
chmod 600 /home/app/sveltekit-starter/.env
sudo systemctl daemon-reload
sudo systemctl enable --now sveltekit-starter
sudo systemctl status sveltekit-starter --no-pager
```

Проверить журнал и локальный HTTP-ответ:

```bash
journalctl -u sveltekit-starter -f
curl -I http://127.0.0.1:5173/
```

## Обновление

```bash
cd /home/app/sveltekit-starter
git pull --ff-only
npm ci
npm run build
sudo systemctl restart sveltekit-starter
```

Изменение runtime-переменных (`NODE_ENV`, `HOST`, `PORT`, `ORIGIN`) требует
перезапуска сервиса.

## Открытие порта

Если внешний доступ к порту 5173 нужен напрямую и на сервере используется
firewalld:

```bash
sudo firewall-cmd --permanent --add-port=5173/tcp
sudo firewall-cmd --reload
sudo firewall-cmd --list-ports
```
