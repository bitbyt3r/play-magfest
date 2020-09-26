module.exports = {
    runtimeCompiler: true,
    devServer: {
        disableHostCheck: true,
        proxy: {
            '^/authenticate': {
                target: 'https://play.magfest.org',
                ws: true,
                changeOrigin: true
            }
        }
    }
}
