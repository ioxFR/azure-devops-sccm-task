"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tl = require("azure-pipelines-task-lib/task");
const fs = require("fs");
const os = require("os");
const path = require("path");
const uuidV4 = require("uuid/v4");
async function run() {
    try {
        tl.setResourcePath(path.join(__dirname, "task.json"));
        const errorActionPreference = tl.getInput("errorActionPreference", false) || "Stop";
        switch (errorActionPreference.toUpperCase()) {
            case "STOP":
            case "CONTINUE":
            case "SILENTLYCONTINUE":
                break;
            default:
                throw new Error(tl.loc("JS_InvalidErrorActionPreference", errorActionPreference));
        }
        const ServiceEndpoint = tl.getInput("sccmcredentials", true);
        const sccmPackageName = tl.getInput("UniquePackageName", true);
        const sccmPackagePath = tl.getInput("PackagePath", true);
        const sccmFolderPath = tl.getInput("SccmFolderPath", true);
        const dpGroupsString = tl.getInput("dpGroups", true);
        if (dpGroupsString !== undefined) {
            const sccmDpGroups = dpGroupsString.split(",");
        }
        const appName = tl.getInput("appName", true);
        const appDescription = tl.getInput("appDescription", true);
        const appIconPath = tl.getInput("appIcon", true);
        const appKeyword = tl.getInput("appKeyword", false);
        const appVersion = tl.getInput("appVersion", true);
        const appPublisher = tl.getInput("appPublisher", false);
        const endpoint = "";
        console.log(ServiceEndpoint);
        console.log(tl.loc("GeneratingScript"));
        const contents = [];
        contents.push("$pwd = ConvertTo-SecureString 'MyP@55w0rd' -AsPlainText -Force");
        contents.push("$credentials = New-Object System.Management.Automation.PSCredential($user,$pwd)");
        contents.push("Enter-PSSession -ComputerName fsdfsf -Credential $credentials –Authentication CredSSP");
        contents.push("Exit-PSSession");
        tl.assertAgent("2.115.0");
        const tempDirectory = tl.getVariable("agent.tempDirectory");
        if (tempDirectory !== undefined) {
            tl.checkPath(tempDirectory, `${tempDirectory} (agent.tempDirectory)`);
            const filePath = path.join(tempDirectory, uuidV4() + ".ps1");
            await fs.writeFile(filePath, "\ufeff" + contents.join(os.EOL), callback);
            const powershell = tl.tool(tl.which("pwsh") || tl.which("powershell") || tl.which("pwsh", true))
                .arg("-NoLogo")
                .arg("-NoProfile")
                .arg("-NonInteractive")
                .arg("-ExecutionPolicy")
                .arg("Unrestricted")
                .arg("-Command")
                .arg(`. '${filePath.replace(/'/g, "''")}'`);
            const options = {
                cwd: "./",
                failOnStdErr: false,
                errStream: process.stdout,
                outStream: process.stdout,
                ignoreReturnCode: true
            };
            const stderrFailure = false;
            const exitCode = await powershell.exec(options);
            if (exitCode !== 0) {
                tl.setResult(tl.TaskResult.Failed, tl.loc("JS_ExitCode", exitCode));
            }
            if (stderrFailure) {
                tl.setResult(tl.TaskResult.Failed, tl.loc("JS_Stderr"));
            }
        }
    }
    catch (err) {
        tl.setResult(tl.TaskResult.Failed, err.message || "run() failed");
    }
}
function callback() { }
run();
//# sourceMappingURL=sccmpowershell.js.map