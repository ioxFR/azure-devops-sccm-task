const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const ReplaceInFileWebpackPlugin = require("replace-in-file-webpack-plugin");
const WebpackCommon = require("./webpack.common.config");

const Target = WebpackCommon.GetTargetPath();

const Settings = {
    "production": {
        Tag: "",
        TaskGuid: "ee4fe03c-58e6-4412-8f78-263466d35a4a",
    },
    "development": {
        Tag: "Dev",
        TaskGuid: "bb012fdf-81cb-4947-975a-55653f1ace68",
    }
    // Can add more flavors here as needed. For example, a flavor for pre-production
};

module.exports = env => {

    const validEnvs = Object.keys(Settings);
    if (!validEnvs.includes(env)) {
        console.error(`BUILD_ENV not set correctly. Allowed values are: ${validEnvs.join(", ")}`);
        process.exit(1);
    }

    const config = {

        entry: {
            "main": "./src/sccm-task/main.ts",
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
                    from: path.join(__dirname, "./src/sccm-task/task.json"),
                    to: path.join(Target, "sccm-task")
                },
                {
                    from: path.join(__dirname, "./images/icon.png"),
                    to: path.join(Target, "sccm-task", "icon.png")
                },
                {
                    from: path.join(__dirname, "./manifests/base.json"),
                    to: Target
                },
                {
                    from: path.join(__dirname, "./manifests/overview.md"),
                    to: Target
                },
                {
                    from: path.join(__dirname, "./manifests/license.txt"),
                    to: Target
                },
                {
                    from: path.join(__dirname, "./manifests", `${env}.json`),
                    to: Target
                },
                {
                    from: path.join(__dirname, "./images/icon.png"),
                    to: Target
                },
                {
                    from: path.join(__dirname, "./src/README.md"),
                    to: Target
                }
            ]),

            WebpackCommon.PackageJsonLoadFixer(Target, [
                "sccm-task/main.js",
            ]),

            WebpackCommon.VersionStringReplacer(Target, [
                "sccm-task/task.json",
                "base.json"
            ]),

            new ReplaceInFileWebpackPlugin([
                {
                    dir: Target,
                    files: [
                        "sccm-task/main.js",
                        "sccm-task/task.json",
                        "base.json"
                    ],
                    rules: [
                        // This replacement is required to allow azure-pipelines-task-lib to load the 
                        // json resource file correctly
                        {
                            search: /__webpack_require__\(.*\)\(resourceFile\)/,
                            replace: 'require(resourceFile)'
                        },
                        {
                            search: /{{taskid}}/ig,
                            replace: Settings[env].TaskGuid
                        },
                        {
                            search: /{{tag}}/ig,
                            replace: Settings[env].Tag
                        }
                    ]
                }
            ])
        ],
    };

    return WebpackCommon.FillDefaultNodeSettings(config, env, "sccm-task");
};
