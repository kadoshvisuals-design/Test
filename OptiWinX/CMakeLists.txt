cmake_minimum_required(VERSION 3.20)
project(OptiWinX VERSION 2.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# Ensure 64-bit architecture
if(CMAKE_SIZEOF_VOID_P EQUAL 4)
    message(FATAL_ERROR "OptiWinX strictly requires a 64-bit target architecture (x64).")
endif()

# Compiler options
if(MSVC)
    add_compile_options(/W4 /permissive- /utf-8)
    add_compile_definitions(UNICODE _UNICODE NOMINMAX WIN32_LEAN_AND_MEAN)
else()
    add_compile_options(-Wall -Wextra -pedantic)
endif()

include_directories(include)

# Subsystem Source Files
set(OPTIWIN_SOURCES
    src/HardwareDetector.cpp
    src/PerformanceMonitor.cpp
    src/MemoryManager.cpp
    src/ProcessEngine.cpp
    src/BottleneckAnalyzer.cpp
    src/TransactionJournal.cpp
    src/GamingModeEngine.cpp
    src/Diagnostics.cpp
    src/StartupManager.cpp
    src/CleanupManager.cpp
    src/OptiWinGUI.cpp
)

# Main Executable
add_executable(OptiWinX
    src/MainApp.cpp
    ${OPTIWIN_SOURCES}
)

# Test Executable
add_executable(OptiWinX_Tests
    tests/TestRunner.cpp
    ${OPTIWIN_SOURCES}
)

# Windows Library Linkage
if(WIN32)
    target_link_libraries(OptiWinX PRIVATE
        kernel32
        user32
        gdi32
        advapi32
        shell32
        ole32
        comctl32
        psapi
        dxgi
    )

    target_link_libraries(OptiWinX_Tests PRIVATE
        kernel32
        user32
        gdi32
        advapi32
        shell32
        ole32
        comctl32
        psapi
        dxgi
    )
endif()

enable_testing()
add_test(NAME OptiWinX_SafetySuite COMMAND OptiWinX_Tests)
