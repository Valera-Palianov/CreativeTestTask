# Creative Test Task
Тестовое задание по верске без js библиотек

Команды:
npm build - сборка проекта в режиме разработчика
npm prod - сборка проекта в режиме production
npm dev - запуск сервера разработки

В проекте используется PUG, так как без шаблонизатора БЭМ реализовать проблематично
Код транслируется в ES5 с помощью babel

css автоматически дополняется префиксирами с помощью autoprefixer и postcss, и проверяется на поддержку браузерами с помощью doiuse