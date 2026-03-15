fn main() {
    // Windowsのセキュリティ・ネットワーク関連のシステムライブラリをリンクする指示
    println!("cargo:rustc-link-lib=crypt32");
    println!("cargo:rustc-link-lib=advapi32");
    println!("cargo:rustc-link-lib=user32");
    println!("cargo:rustc-link-lib=ws2_32");
    println!("cargo:rustc-link-lib=cryptui");
    println!("cargo:rustc-link-lib=xmllite");
    // --- 今回追加するピース ---
    println!("cargo:rustc-link-lib=iphlpapi"); // if_nametoindex 用
    println!("cargo:rustc-link-lib=secur32");  // InitSecurityInterfaceW 用
}