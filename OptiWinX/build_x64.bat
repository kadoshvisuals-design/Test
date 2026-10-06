@echo off
setlocal enabledelayedexpansion

echo =====================================================================
echo           OptiWinX v2.0 - Windows Native x64 Build System            
echo =====================================================================

REM Step 1: Detect required tools
echo [1/5] Detecting build tools...

where cmake >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] CMake 3.20+ is required but not found in system PATH.
    echo Please install CMake from https://cmake.org/download/ and try again.
    exit /b 1
)

where cl >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [WARN] MSVC 'cl.exe' not found in current environment.
    echo Attempting to locate Visual Studio 2022 vcvars64.bat...
    
    set "VS_PATH="
    if exist "%ProgramFiles%\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvars64.bat" (
        set "VS_PATH=%ProgramFiles%\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvars64.bat"
    ) else if exist "%ProgramFiles%\Microsoft Visual Studio\2022\Professional\VC\Auxiliary\Build\vcvars64.bat" (
        set "VS_PATH=%ProgramFiles%\Microsoft Visual Studio\2022\Professional\VC\Auxiliary\Build\vcvars64.bat"
    ) else if exist "%ProgramFiles%\Microsoft Visual Studio\2022\Enterprise\VC\Auxiliary\Build\vcvars64.bat" (
        set "VS_PATH=%ProgramFiles%\Microsoft Visual Studio\2022\Enterprise\VC\Auxiliary\Build\vcvars64.bat"
    ) else if exist "%ProgramFiles(x86)%\Microsoft Visual Studio\2022\BuildTools\VC\Auxiliary\Build\vcvars64.bat" (
        set "VS_PATH=%ProgramFiles(x86)%\Microsoft Visual Studio\2022\BuildTools\VC\Auxiliary\Build\vcvars64.bat"
    )

    if defined VS_PATH (
        echo Found Visual Studio 2022 environment: "!VS_PATH!"
        call "!VS_PATH!"
    ) else (
        echo [ERROR] Visual Studio 2022 (MSVC v143 x64) could not be located.
        echo Please run this script from the 'x64 Native Tools Command Prompt for VS 2022'.
        exit /b 1
    )
)

echo [OK] CMake and MSVC x64 compiler detected.

REM Step 2: Configure directories
set "BUILD_DIR=%~dp0build_x64_release"
if not exist "%BUILD_DIR%" (
    mkdir "%BUILD_DIR%"
)

REM Step 3: Configure CMake with Visual Studio 2022 x64 generator
echo [2/5] Configuring CMake for Visual Studio 2022 x64...
cmake -S "%~dp0" -B "%BUILD_DIR%" -G "Visual Studio 17 2022" -A x64
if %ERRORLEVEL% neq 0 (
    echo [ERROR] CMake configuration failed.
    exit /b %ERRORLEVEL%
)

REM Step 4: Build Release x64
echo [3/5] Compiling OptiWinX Release x64 binary...
cmake --build "%BUILD_DIR%" --config Release --target OptiWinX OptiWinX_Tests --parallel
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Build compilation failed. Inspect compiler logs above.
    exit /b %ERRORLEVEL%
)

REM Step 5: Execute Automated Safety Tests
echo [4/5] Executing OptiWinX safety invariant test suite...
"%BUILD_DIR%\Release\OptiWinX_Tests.exe"
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Unit and safety tests failed! Build rejected.
    exit /b %ERRORLEVEL%
)

REM Step 6: Output final executable
echo [5/5] Build and verification completed successfully!
echo ---------------------------------------------------------------------
echo Final Executable: "%BUILD_DIR%\Release\OptiWinX.exe"
echo Test Executable:  "%BUILD_DIR%\Release\OptiWinX_Tests.exe"
echo ---------------------------------------------------------------------
echo You may now run OptiWinX:
echo   "%BUILD_DIR%\Release\OptiWinX.exe" --analyze
echo   "%BUILD_DIR%\Release\OptiWinX.exe" --dry-run
echo =====================================================================
exit /b 0
