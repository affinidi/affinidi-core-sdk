const { readFileSync, writeFileSync, statSync, readdirSync } = require('fs')
const { resolve: resolvePath, join: pathJoin } = require('path')



const readdirSyncRec = (p, a = []) => {
  if (['node_modules', 'dist', 'coverage', 'src', 'test', '.nyc_output', '.git'].find(e => p.endsWith(e))) return a
  if (statSync(p).isDirectory())
    readdirSync(p).map(f => readdirSyncRec(a[a.push(pathJoin(p, f)) - 1], a))
  return a
}

const readcin = async () => {
  return new Promise(resolve => process.stdin.once('data', (data) => {
    resolve(data.toString().trim())
  }))
}

const getNextVersion = (pathToPkg, type) => {
  const prev = readFileSync(pathToPkg).toString()
  const json = JSON.parse(prev)
  const prevVersion = json.version
  let numbers = prevVersion.split('.')
    .map((e) => Number(e))
  const numberToIncrease = type === 'major' ? 0 : type === 'minor' ? 1 : 2

  numbers = numbers.map((e, i) => {
    if (i === numberToIncrease) return e + 1
    if (i > numberToIncrease) return 0
    return e
  })

  return numbers.map((e) => String(e)).join('.')
}

const getLatestInternalVersion = () => {
  const paths = readdirSyncRec(resolvePath(__dirname, '..')).filter(e => e.endsWith('package.json'))
  const jsons = paths.map(p => JSON.parse(readFileSync(p).toString()))
  return jsons.reduce((res, json) => ({
    ...res, [json.name]: json.version
  }), {})
}

const addChangelog = (pathToChangelog, update) => {
  const prev = readFileSync(pathToChangelog).toString()

  const next = `${update}\n${prev}`
  writeFileSync(pathToChangelog, Buffer.from(next, 'utf8'))
}

const updatePkgJsonWithVersion = (pathToPkg, version) => {
  const jsonStr = readFileSync(pathToPkg).toString()
  const line = jsonStr.split('\n')[1]
  const jsonSpaceNumber = line.startsWith('\t') ? '\t' : 2

  const json = JSON.parse(jsonStr)

  json.version = version
  const next = JSON.stringify(json, null, jsonSpaceNumber)
  writeFileSync(pathToPkg, Buffer.from(next, 'utf8'))
}

const updatePkgJsonWithDeps = (pathToPkg, deps) => {
  const prev = readFileSync(pathToPkg).toString()
  const json = JSON.parse(prev)

  Object.entries(deps).forEach(([name, version]) => {
    if (json.dependencies[name]) {
      const withCaret = json.dependencies[name].startsWith('^')
      json.dependencies[name] = (withCaret ? '^' : '') + version
    }
  })


  const next = JSON.stringify(json, null, 2)
  writeFileSync(pathToPkg, Buffer.from(next, 'utf8'))
}

const updateLib = async () => {
  console.log('Enter lib name')

  const libname = await readcin()

  const libRoot = resolvePath(__dirname, '..', 'common-libs', libname)

  if (!statSync(libRoot).isDirectory()) {
    throw new Error(`No lib with name ${libname}`)
  }

  return updatelibs('common-libs', [libname])
}

const updatelibs = async (prefix = 'sdk', names = ['browser', 'core', 'expo', 'node', 'react-native']) => {
  console.log('Enter type of update: \'major\', \'minor\', \'patch\'')
  const type = await readcin()

  if (!['major', 'minor', 'patch'].includes(type)) {
    throw new Error(`Update should be one of 'major', 'minor', 'patch', when given ${type}`)
  }

  console.log('Enter changelog note')

  const changelogNote = await readcin()

  const libsRoots = names.map(e => resolvePath(__dirname, '..', prefix, e))

  libsRoots.forEach((rootPath) => {
    const changelogPath = resolvePath(rootPath, 'CHANGELOG.md')
    const pkgJsonPath = resolvePath(rootPath, 'package.json')
    const pkgLockJsonPath = resolvePath(rootPath, 'package-lock.json')

    const nextVersion = getNextVersion(pkgJsonPath, type)
    const changeLogUpdate = `# release ${nextVersion} (${new Date().toISOString().split('T')[0]})\n${changelogNote}`

    addChangelog(changelogPath, changeLogUpdate)
    updatePkgJsonWithVersion(pkgJsonPath, nextVersion)
    updatePkgJsonWithVersion(pkgLockJsonPath, nextVersion)
  })

  const deps = getLatestInternalVersion()

  libsRoots.forEach((rootPath) => {
    const pkgJsonPath = resolvePath(rootPath, 'package.json')

    updatePkgJsonWithDeps(pkgJsonPath, deps)
  })

}

const main = async () => {
  try {
    console.log('Choose action:\n"sdk"\n"lib"')
    const action = await readcin()
    if (!['sdk', 'lib'].includes(action)) {
      throw new Error('Not allowed action')
    }
    if (action === 'sdk') {
      await updatelibs()
    }

    if (action === 'lib') {
      await updateLib()
    }
    process.exit(0)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }

}

main()