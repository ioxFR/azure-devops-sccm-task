"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var tl = require("azure-pipelines-task-lib/task");
var fs = require("fs");
var os = require("os");
var path = require("path");
var uuidV4 = require("uuid/v4");
function run() {
    return __awaiter(this, void 0, void 0, function () {
        var errorActionPreference, ServiceEndpoint, sccmPackageName, sccmPackagePath, sccmFolderPath, dpGroupsString, sccmDpGroups, appName, appDescription, appIconPath, appKeyword, appVersion, appPublisher, endpoint, contents, tempDirectory, filePath, powershell, options, stderrFailure, exitCode, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    tl.setResourcePath(path.join(__dirname, "task.json"));
                    errorActionPreference = tl.getInput("errorActionPreference", false) || "Stop";
                    switch (errorActionPreference.toUpperCase()) {
                        case "STOP":
                        case "CONTINUE":
                        case "SILENTLYCONTINUE":
                            break;
                        default:
                            throw new Error(tl.loc("JS_InvalidErrorActionPreference", errorActionPreference));
                    }
                    ServiceEndpoint = tl.getInput("sccmcredentials", true);
                    sccmPackageName = tl.getInput("UniquePackageName", true);
                    sccmPackagePath = tl.getInput("PackagePath", true);
                    sccmFolderPath = tl.getInput("SccmFolderPath", true);
                    dpGroupsString = tl.getInput("dpGroups", true);
                    if (dpGroupsString !== undefined) {
                        sccmDpGroups = dpGroupsString.split(",");
                    }
                    appName = tl.getInput("appName", true);
                    appDescription = tl.getInput("appDescription", true);
                    appIconPath = tl.getInput("appIcon", true);
                    appKeyword = tl.getInput("appKeyword", false);
                    appVersion = tl.getInput("appVersion", true);
                    appPublisher = tl.getInput("appPublisher", false);
                    endpoint = "";
                    console.log(ServiceEndpoint);
                    // Generate the script contents.
                    console.log(tl.loc("GeneratingScript"));
                    contents = [];
                    // We define credentials for sccm server
                    contents.push("$pwd = ConvertTo-SecureString 'MyP@55w0rd' -AsPlainText -Force");
                    contents.push("$credentials = New-Object System.Management.Automation.PSCredential($user,$pwd)");
                    // We start remote session CredSSP Enabled
                    contents.push("Enter-PSSession -ComputerName fsdfsf -Credential $credentials –Authentication CredSSP");
                    // We close remote connection
                    contents.push("Exit-PSSession");
                    // contents.push(scriptInline);
                    // Write the script to disk.
                    tl.assertAgent("2.115.0");
                    tempDirectory = tl.getVariable("agent.tempDirectory");
                    if (!(tempDirectory !== undefined)) return [3 /*break*/, 3];
                    tl.checkPath(tempDirectory, tempDirectory + " (agent.tempDirectory)");
                    filePath = path.join(tempDirectory, uuidV4() + ".ps1");
                    return [4 /*yield*/, fs.writeFile(filePath, "\ufeff" + contents.join(os.EOL), callback)];
                case 1:
                    _a.sent(); // Since UTF8 encoding is specified, node will
                    powershell = tl.tool(tl.which("pwsh") || tl.which("powershell") || tl.which("pwsh", true))
                        .arg("-NoLogo")
                        .arg("-NoProfile")
                        .arg("-NonInteractive")
                        .arg("-ExecutionPolicy")
                        .arg("Unrestricted")
                        .arg("-Command")
                        .arg(". '" + filePath.replace(/'/g, "''") + "'");
                    options = {
                        cwd: "./",
                        failOnStdErr: false,
                        errStream: process.stdout,
                        outStream: process.stdout,
                        ignoreReturnCode: true
                    };
                    stderrFailure = false;
                    return [4 /*yield*/, powershell.exec(options)];
                case 2:
                    exitCode = _a.sent();
                    // Fail on exit code.
                    if (exitCode !== 0) {
                        tl.setResult(tl.TaskResult.Failed, tl.loc("JS_ExitCode", exitCode));
                    }
                    // Fail on stderr.
                    if (stderrFailure) {
                        tl.setResult(tl.TaskResult.Failed, tl.loc("JS_Stderr"));
                    }
                    _a.label = 3;
                case 3: return [3 /*break*/, 5];
                case 4:
                    err_1 = _a.sent();
                    tl.setResult(tl.TaskResult.Failed, err_1.message || "run() failed");
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function callback() { }
run();
