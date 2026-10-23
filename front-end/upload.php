<?php
// 1. Autoriser le CRM, le Front et ton localhost en dev (CORS)
$allowed_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://tondomaine.com",
    "https://crm.tondomaine.com"
];

if (isset($_SERVER['HTTP_ORIGIN']) && in_array($_SERVER['HTTP_ORIGIN'], $allowed_origins)) {
    header("Access-Control-Allow-Origin: " . $_SERVER['HTTP_ORIGIN']);
} else {
    header("Access-Control-Allow-Origin: *");
}

header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !isset($_FILES['file'])) {
    http_response_code(400);
    echo json_encode(["message" => "Aucun fichier reçu."]);
    exit();
}

$file = $_FILES['file'];
$originalName = $file['name'];
$fileSize = $file['size'];
$ext = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));

$img_ext = ['jpg', 'jpeg', 'png', 'webp'];
$doc_ext = ['pdf', 'doc', 'docx'];

$isImage = in_array($ext, $img_ext);
$isDoc = in_array($ext, $doc_ext);

// 2. Vérification des formats
if (!$isImage && !$isDoc) {
    http_response_code(400);
    echo json_encode(["message" => "Format non accepté (PDF, DOC, DOCX, JPG, PNG ou WEBP)."]);
    exit();
}

// 3. Vérification des tailles (5 Mo pour images, 10 Mo pour manuscrits)
if ($isImage && $fileSize > 5 * 1024 * 1024) {
    http_response_code(400);
    echo json_encode(["message" => "Image trop volumineuse (5 Mo maximum)."]);
    exit();
}

if ($isDoc && $fileSize > 10 * 1024 * 1024) {
    http_response_code(400);
    echo json_encode(["message" => "Fichier trop volumineux (10 Mo maximum)."]);
    exit();
}

// 4. Dossier de destination
$folder = $isImage ? "images" : "manuscripts";
$targetDir = __DIR__ . "/uploads/" . $folder . "/";

if (!is_dir($targetDir)) {
    mkdir($targetDir, 0755, true);
}

// 5. Nom aléatoire unique (comme crypto.randomBytes(16) dans ton server.js)
$newFileName = bin2hex(random_bytes(16)) . '.' . $ext;
$targetFilePath = $targetDir . $newFileName;

if (move_uploaded_file($file['tmp_name'], $targetFilePath)) {
    // 6. URL publique absolue accessible partout
    $domain = "https://tondomaine.com"; // <-- Remplace par ton vrai nom de domaine
    $publicUrl = $domain . "/uploads/" . $folder . "/" . $newFileName;

    // Retourne le format exact attendu par ton CRM et ton FileUpload.tsx
    http_response_code(201);
    echo json_encode([
        "url" => $publicUrl,
        "name" => $originalName,
        "size" => $fileSize
    ]);
    exit();
} else {
    http_response_code(500);
    echo json_encode(["message" => "Téléversement impossible sur le serveur."]);
    exit();
}