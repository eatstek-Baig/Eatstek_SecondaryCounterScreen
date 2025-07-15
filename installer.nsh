!macro preInit
  ReadRegStr $R0 HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_GUID}" "UninstallString"
  StrCmp $R0 "" notInstalled
    MessageBox MB_OKCANCEL|MB_ICONQUESTION "${PRODUCT_NAME} is already installed. $
$
Click OK to repair the installation or Cancel to uninstall the existing version first." IDOK repair
      ExecWait '$R0 _?=$INSTDIR'
      Quit
    repair:
  notInstalled:
!macroend
