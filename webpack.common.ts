import { join } from "path";
import { Configuration, WebpackPluginInstance } from "webpack";
import CopyPlugin from "copy-webpack-plugin";
import { LicenseWebpackPlugin } from "license-webpack-plugin";

const config: Configuration = {
    entry: {
        background: join(__dirname, "src/background/index.ts"),
        popup: join(__dirname, "src/popup/index.ts"),
        settings: join(__dirname, "src/settings/index.ts"),
        acknowledgements: join(__dirname, "src/acknowledgements/index.ts"),
    },
    output: {
        path: join(__dirname, "dist"),
        filename: "js/[name].js",
    },
    module: {
        rules: [
            {
                exclude: /node_modules/,
                test: /\.tsx?$/,
                use: "ts-loader",
            },
            {
                test: /\.svg$/,
                use: [
                    {
                        loader: "file-loader",
                        options: {
                            name: "[hash]-[name].[ext]",
                            outputPath: "static/images",
                            publicPath: "/static/images",
                        },
                    },
                ],
            },
        ],
    },
    resolve: {
        extensions: [".ts", ".js"],
        alias: {
            common: join(__dirname, "src/common"),
        },
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                {
                    from: join(__dirname, "resources/manifest.json"),
                    to: join(__dirname, "dist/manifest.json"),
                    transform(content) {
                        const manifest = JSON.parse(content.toString());
                        const packageJSON = require("./package.json");

                        manifest.version = packageJSON.version;
                        manifest.version_name = `v${packageJSON.version}`;
                        manifest.description = packageJSON.description;
                        manifest.author = packageJSON.author;

                        return Buffer.from(JSON.stringify(manifest, null, 4));
                    },
                },
            ],
        }),
        // typings are broken :/
        // therefore, nuclear option
        (new LicenseWebpackPlugin({
            perChunkOutput: false,
            stats: {
                warnings: false,
                errors: true,
            },
            outputFilename: "licenses.json",
            renderLicenses: modules =>
                JSON.stringify(
                    modules.map(module => ({
                        name: module.name,
                        version: module.packageJson.version,
                        author: (module.packageJson as any).author,
                        license: module.licenseId,
                        licenseText: module.licenseText,
                    }))
                ),
        }) as unknown) as WebpackPluginInstance,
    ],
};

export default config;
