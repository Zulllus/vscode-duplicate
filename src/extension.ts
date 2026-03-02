import { ExtensionContext, Uri, commands, env } from 'vscode'
import duplicate from './commands/duplicate'
import duplicateAsShortcut from './commands/duplicateAsShortcut'
import LnkProvider from './lnkProvider' // <-- Импортируем наш новый провайдер
import Config from './config'
import l10n from './l10n'

export const EXTENSION_ID = 'duplicate-and-link'

export async function activate(context: ExtensionContext) {
    const config = new Config(context)

    await l10n.init({
        extensionPath: context.extensionPath,
        language: env.language,
    })

    // Оригинальная команда дублирования
    context.subscriptions.push(commands.registerCommand(
        `${EXTENSION_ID}.execute`,
        (uri?: Uri) => duplicate(uri, config)),
    )

    // Команда создания ярлыка
    context.subscriptions.push(commands.registerCommand(
        `${EXTENSION_ID}.duplicateAsShortcut`,
        (uri?: Uri) => duplicateAsShortcut(uri)),
    )

    // РЕГИСТРАЦИЯ ПРОВАЙДЕРА ДЛЯ ЧТЕНИЯ .lnk
    context.subscriptions.push(LnkProvider.register())
}

export function deactivate() {}
