import * as vscode from 'vscode'
import ws from './ws'

class LnkDocument implements vscode.CustomDocument {
    public readonly uri: vscode.Uri

    private constructor(uri: vscode.Uri) {
        this.uri = uri
    }

    dispose(): void {}

    static async create(uri: vscode.Uri) {
        return new LnkDocument(uri)
    }
}

export default class LnkProvider implements vscode.CustomReadonlyEditorProvider<LnkDocument> {
    public static readonly viewType = 'lnk.connector'

    public static register(): vscode.Disposable {
        return vscode.window.registerCustomEditorProvider(
            LnkProvider.viewType,
            new LnkProvider(),
            { supportsMultipleEditorsPerDocument: false },
        )
    }

    // Здесь мы больше ничего не открываем, просто отдаем модель документа
    async openCustomDocument(uri: vscode.Uri): Promise<LnkDocument> {
        return await LnkDocument.create(uri)
    }

    // Делаем метод асинхронным и переносим всю магию сюда
    async resolveCustomEditor(
        document: LnkDocument,
        webviewPanel: vscode.WebviewPanel,
    ): Promise<void> {

        // Рисуем невидимую заглушку, чтобы редактор не ругался на пустой контент
        webviewPanel.webview.options = { enableScripts: false }
        webviewPanel.webview.html = '<!DOCTYPE html><html><body style="background:transparent;"></body></html>'

        try {
            // Читаем куда ведет ярлык
            const { target } = await ws.query(document.uri.fsPath)
            if (target) {
                const targetUri = vscode.Uri.file(target)
                // Открываем оригинал (он перехватит фокус на себя)
                await vscode.commands.executeCommand('vscode.open', targetUri)
            }
        } catch (err) {
            vscode.window.showErrorMessage('Ошибка открытия ярлыка (Windows lnk)')
            console.error(err)
        } finally {
            // Самое важное: аккуратно закрываем вкладку .lnk
            // только ПОСЛЕ того, как отработал весь асинхронный код
            webviewPanel.dispose()
        }
    }
}
