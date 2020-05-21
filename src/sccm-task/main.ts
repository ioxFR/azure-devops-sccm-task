import tl = require("azure-pipelines-task-lib/task");
import tr = require("azure-pipelines-task-lib/toolrunner");
import fs = require("fs");
import os = require("os");
import path = require("path");
import uuidV4 = require("uuid/v4");

async function run(){
    try {
        tl.setResourcePath(path.join(__dirname, "task.json"));

        // Get inputs.
        const errorActionPreference: string = tl.getInput("errorActionPreference", false) || "Stop";
        switch (errorActionPreference.toUpperCase()) {
            case "STOP":
            case "CONTINUE":
            case "SILENTLYCONTINUE":
                break;
            default:
                throw new Error(tl.loc("JS_InvalidErrorActionPreference", errorActionPreference));
        }

        const ServiceEndpoint = tl.getInput("sccmcredentials", true);
        const ServiceEndpointHostname = tl.getEndpointAuthorizationParameter(ServiceEndpoint, "hostname", false);
        const ServiceEndpointUsername = tl.getEndpointAuthorizationParameter(ServiceEndpoint, "username", false);
        const ServiceEndpointPassword = tl.getEndpointAuthorizationParameter(ServiceEndpoint, "password", false);

        // SCCM Configuration
        const sccmPackageName = tl.getInput("UniquePackageName", true);
        const sccmPackagePath = tl.getInput("PackagePath", true);
        const sccmFolderPath = tl.getInput("SccmFolderPath", true);
        const dpGroupsString = tl.getInput("dpGroups", true);
        if (dpGroupsString !== undefined)
        {
        const sccmDpGroups: string[] = dpGroupsString.split(",");
        }
        // Application Configuration
        const appName = tl.getInput("appName", true);
        const appDescription = tl.getInput("appDescription", true);
        const appIconPath = tl.getInput("appIcon", true);
        const appKeyword = tl.getInput("appKeyword", false);
        const appVersion = tl.getInput("appVersion", true);
        const appPublisher = tl.getInput("appPublisher", false);

        // Generate the script contents.
        console.log(tl.loc("GeneratingScript"));
        const contents: string[] = [];

        // We define credentials for sccm server
        contents.push("$pwd = ConvertTo-SecureString '" + ServiceEndpointPassword + "' -AsPlainText -Force");
        contents.push("$credentials = New-Object System.Management.Automation.PSCredential("
         + ServiceEndpointUsername
         + ",$pwd)");
        // We start remote session CredSSP Enabled
        contents.push("Enter-PSSession -ComputerName "
         + ServiceEndpointHostname
         + " -Credential $credentials –Authentication CredSSP");

        // We close remote connection
        contents.push("Exit-PSSession");
            // contents.push(scriptInline);

        // Write the script to disk.
        tl.assertAgent("2.115.0");
        const tempDirectory = tl.getVariable("agent.tempDirectory");
        if (tempDirectory !== undefined){
        tl.checkPath(tempDirectory, `${tempDirectory} (agent.tempDirectory)`);
        const filePath = path.join(tempDirectory, uuidV4() + ".ps1");

        await fs.writeFile(
            filePath,
            "\ufeff" + contents.join(os.EOL), callback);           // Since UTF8 encoding is specified, node will
                                            // encode the BOM into its UTF8 binary sequence.

        // Run the script.
        //
        // Note, prefer "pwsh" over "powershell". At some point we can remove support for "powershell".
        //
        // Note, use "-Command" instead of "-File" to match the Windows implementation. Refer to
        // comment on Windows implementation for an explanation why "-Command" is preferred.
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
            errStream: process.stdout, // Direct all output to STDOUT, otherwise the output may appear out
            outStream: process.stdout, // of order since Node buffers it's own STDOUT but not STDERR.
            ignoreReturnCode: true
        } as tr.IExecOptions;

        // Listen for stderr.
        const stderrFailure = false;
        // if (_vsts_input_failOnStandardError) {
           /* powershell.on('stderr', (data) => {
                stderrFailure = true;
            });*/
        // }

        // Run bash.
        const exitCode: number = await powershell.exec(options);

        // Fail on exit code.
        if (exitCode !== 0) {
            tl.setResult(tl.TaskResult.Failed, tl.loc("JS_ExitCode", exitCode));
        }

        // Fail on stderr.
        if (stderrFailure) {
            tl.setResult(tl.TaskResult.Failed, tl.loc("JS_Stderr"));
        }
    }
    }
    catch (err) {
        tl.setResult(tl.TaskResult.Failed, err.message || "run() failed");
    }
}
function callback(){}

run();
