const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const ReplaceInFileWebpackPlugin = require("replace-in-file-webpack-plugin");
const WebpackCommon = require("./webpack.common.config");

const Target = WebpackCommon.GetTargetPath();

module.exports = env => {

    const config = {

        entry: {
            "main": "./buildAndReleaseTask/sccmpowershell.ts",
        },

        plugins: [
            new CopyWebpackPlugin([
                // These files are needed by azure-pipelines-task-lib library.
                {
                    from: path.resolve("./node_modules/azure-pipelines-task-lib/lib.json"),
                    to: path.join(Target, "sccm-task")
                },
                {
                    from: path.resolve("./node_modules/azure-pipelines-task-lib/Strings"),
                    to: path.join(Target, "sccm-task")
                },

                {
                    from: path.join(__dirname, "./vss-extension.json"),
                    to: Target
                                },
                {
                    from: path.join(__dirname, "./buildAndReleaseTask/task.json"),
                    to: path.join(Target, "sccm-task")
                },
                {
                    from: path.join(__dirname, "./images/extension-icon.png"),
                    to: path.join(Target, "sccm-task", "icon.png")
                },
                {
                    from: path.join(__dirname, "./vss-extension.json"),
                    to: Target
                }
            ]),

            WebpackCommon.PackageJsonLoadFixer(Target, [
                "../buildAndReleaseTask/sccmpowershell.js",
            ]),

            WebpackCommon.VersionStringReplacer(Target, [
                "sccm-task/task.json",
                "vss-extension.json"
            ]),

            new ReplaceInFileWebpackPlugin([
                {
                    dir: Target,
                    files: [
                        "../buildAndReleaseTask/sccmpowershell.js",
                        "sccm-task/task.json",
                        "vss-extension.json"
                    ],
                    rules: [
                        // This replacement is required to allow azure-pipelines-task-lib to load the 
                        // json resource file correctly
                        {
                            search: /__webpack_require__\(.*\)\(resourceFile\)/,
                            replace: 'require(resourceFile)'
                        }
                    ]
                }
            ])
        ],
    };

    return WebpackCommon.FillDefaultNodeSettings(config, env, "sccm-task");
};