import { exec, execFile } from 'node:child_process'
import { promisify } from 'node:util'
import * as iconv from 'iconv-lite'

const execSync = promisify(exec)

function expandEnv(path: string) {
    const envRE = /(^|[^^])%((?:\^.|[^^%])*)%/g
    return path.replace(envRE, function(_, g1, g2) {
        return g1 + process.env[g2]
    }).replace(/\^(.)/g, '$1')
}

function parseQuery(stdout: string) {
    const result: any = { expanded: {} }
    stdout.split(/[\r\n]+/)
        .filter(line => line.indexOf('=') !== -1)
        .forEach(line => {
            const pair = line.split('=', 2)
            const key = pair[0]
            const value = pair[1]
            if (key === 'TargetPath') result.target = value
            else if (key === 'TargetPathExpanded') result.expanded.target = value
            // Остальные ключи нам для перехода по ярлыку не особо нужны,
            // но парсер оставляем полным для совместимости
        })
    return result
}

const query = async function (path: string) {
    const buffer = await new Promise<Buffer>((resolve, reject) => {
        execFile(
            __dirname + '/../node_modules/windows-shortcuts/lib/shortcut/Shortcut.exe',
            ['/A:Q', '/F:' + expandEnv(path)],
            { encoding: 'buffer' },
            (err, stdout, stderr) => err ? reject(stderr) : resolve(stdout as unknown as Buffer),
        )
    })
    const encoding = 'cp' + (await execSync('chcp')).stdout.toString().trim().split(' ').pop()
    return parseQuery(iconv.decode(buffer, encoding))
}

export default { query }
