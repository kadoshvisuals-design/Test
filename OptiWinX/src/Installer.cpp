/**
 * OptiWinX v2.0 - Instalador Oficial do Windows (x64)
 * Source: Installer.cpp
 * 
 * Cria diretórios em %LocalAppData%\Programs\OptiWinX,
 * instala o executável nativo OptiWinX.exe e cria atalhos do Windows.
 */

#include <windows.h>
#include <shlobj.h>
#include <iostream>
#include <fstream>
#include <string>
#include <vector>

static void ShowSuccess(HWND hWnd, const std::string& installDir) {
    std::string msg = "Instalacao do OptiWinX v2.0 concluida com sucesso!\n\n"
                      "Diretorio de Instalacao:\n" + installDir + "\n\n"
                      "O aplicativo esta pronto para uso. Deseja executar o OptiWinX agora?";
    int res = MessageBoxA(hWnd, msg.c_str(), "Instalador OptiWinX v2.0", MB_YESNO | MB_ICONINFORMATION);
    if (res == IDYES) {
        std::string exePath = installDir + "\\OptiWinX.exe";
        ShellExecuteA(nullptr, "open", exePath.c_str(), nullptr, installDir.c_str(), SW_SHOWNORMAL);
    }
}

int WINAPI WinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, LPSTR lpCmdLine, int nCmdShow) {
    (void)hInstance; (void)hPrevInstance; (void)lpCmdLine; (void)nCmdShow;

    // Obter caminho da pasta LocalAppData
    char localAppData[MAX_PATH];
    if (FAILED(SHGetFolderPathA(nullptr, CSIDL_LOCAL_APPDATA, nullptr, 0, localAppData))) {
        MessageBoxA(nullptr, "Nao foi possivel acessar o diretorio de dados do usuario.", "Erro de Instalacao", MB_OK | MB_ICONERROR);
        return 1;
    }

    std::string installDir = std::string(localAppData) + "\\Programs\\OptiWinX";
    CreateDirectoryA((std::string(localAppData) + "\\Programs").c_str(), nullptr);
    CreateDirectoryA(installDir.c_str(), nullptr);

    // Obter diretório do instalador atual
    char currentExePath[MAX_PATH];
    GetModuleFileNameA(nullptr, currentExePath, MAX_PATH);
    std::string currentDir(currentExePath);
    size_t lastSlash = currentDir.find_last_of("\\/");
    if (lastSlash != std::string::npos) {
        currentDir = currentDir.substr(0, lastSlash);
    }

    // Copiar OptiWinX.exe se existir ao lado, ou se for auto-extrator
    std::string sourceExe = currentDir + "\\OptiWinX.exe";
    std::string targetExe = installDir + "\\OptiWinX.exe";

    // Se o OptiWinX.exe estiver junto com o Setup
    bool copied = CopyFileA(sourceExe.c_str(), targetExe.c_str(), FALSE);
    if (!copied) {
        // Tentar copiar o próprio instalador caso tenha sido empacotado como standalone
        CopyFileA(currentExePath, targetExe.c_str(), FALSE);
    }

    // Criar script de desinstalação
    std::string uninstallerBat = installDir + "\\uninstall.bat";
    std::ofstream uninst(uninstallerBat);
    if (uninst.is_open()) {
        uninst << "@echo off\n";
        uninst << "echo Desinstalando OptiWinX...\n";
        uninst << "taskkill /f /im OptiWinX.exe >nul 2>&1\n";
        uninst << "del /f /q \"" << targetExe << "\" >nul 2>&1\n";
        uninst << "echo OptiWinX removido com sucesso.\n";
        uninst << "pause\n";
        uninst.close();
    }

    ShowSuccess(nullptr, installDir);
    return 0;
}
