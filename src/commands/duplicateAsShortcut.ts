import { join, parse } from 'node:path'
import { Uri, window } from 'vscode'
import * as ws from 'windows-shortcuts'
import l10n from '../l10n'

export default async function duplicateAsShortcut(arg: Uri | undefined) {
    const fsPath = arg?.fsPath ?? window.activeTextEditor?.document.uri.fsPath
    if (!fsPath) return

    const parsedPath = parse(fsPath)
    const destPath = join(parsedPath.dir, `${parsedPath.name}.lnk`)

    // ИСПРАВЛЕНО: Сначала передаем destPath (где создать), потом fsPath (на что ссылаться)
    ws.create(destPath, fsPath, (err) => {
        if (err) {
            window.showErrorMessage(l10n.t('error.create-shortcut', String(err)))
        } else {
            window.showInformationMessage(l10n.t('info.create-shortcut', `${parsedPath.name}.lnk`))
        }
    })
}
