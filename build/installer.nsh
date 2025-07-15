!macro preInit
  SetRegView 64
  ReadRegStr $R0 HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_GUID}" "UninstallString"
  StrCmp $R0 "" notInstalled
    MessageBox MB_ICONSTOP|MB_OK "${PRODUCT_NAME} is already installed.$\n$\nPlease uninstall the existing version before installing again."
    Quit
  notInstalled:
!macroend