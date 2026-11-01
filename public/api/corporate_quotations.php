<?php
/**
 * Dorat Cars - Corporate Quotations Server API
 * Provides centralized cloud persistence for all employees and devices.
 * Server: Hostinger (bi.doracar.com)
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$dataDir = __DIR__ . '/../data';
$dataFile = $dataDir . '/corporate_quotes.json';
$htaccessFile = $dataDir . '/.htaccess';

// Ensure data directory exists and is secured
if (!file_exists($dataDir)) {
    mkdir($dataDir, 0755, true);
}
if (!file_exists($htaccessFile)) {
    file_put_contents($htaccessFile, "Order Allow,Deny\nDeny from all\n");
}

function getStoredQuotes($dataFile) {
    if (!file_exists($dataFile)) {
        return [];
    }
    $raw = @file_get_contents($dataFile);
    if (!$raw) return [];
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

function saveStoredQuotes($dataFile, $quotes) {
    $json = json_encode($quotes, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    return @file_put_contents($dataFile, $json, LOCK_EX);
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $quotes = getStoredQuotes($dataFile);
    echo json_encode([
        'success' => true,
        'count' => count($quotes),
        'quotes' => $quotes,
        'timestamp' => date('Y-m-d H:i:s')
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($method === 'POST') {
    $input = file_get_contents('php://input');
    $payload = json_decode($input, true);

    if (!$payload) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid JSON payload']);
        exit;
    }

    $action = $payload['action'] ?? 'save';
    $currentQuotes = getStoredQuotes($dataFile);
    $now = date('Y-m-d H:i:s');

    if ($action === 'delete') {
        $id = $payload['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Missing quote id']);
            exit;
        }
        $filtered = array_values(array_filter($currentQuotes, function($q) use ($id) {
            return ($q['id'] ?? '') !== $id;
        }));
        saveStoredQuotes($dataFile, $filtered);
        echo json_encode(['success' => true, 'action' => 'deleted', 'id' => $id]);
        exit;
    }

    // Default action: save / upsert
    $quote = $payload['quote'] ?? $payload;
    if (empty($quote['id'])) {
        $quote['id'] = 'QUO-' . round(microtime(true) * 1000);
    }
    $quote['updatedAt'] = $now;

    $foundIndex = -1;
    foreach ($currentQuotes as $idx => $existing) {
        if (($existing['id'] ?? '') === $quote['id'] || 
            (!empty($quote['quoteNumber']) && ($existing['quoteNumber'] ?? '') === $quote['quoteNumber'])) {
            $foundIndex = $idx;
            break;
        }
    }

    if ($foundIndex >= 0) {
        $currentQuotes[$foundIndex] = array_merge($currentQuotes[$foundIndex], $quote);
    } else {
        if (empty($quote['createdAt'])) {
            $quote['createdAt'] = $now;
        }
        array_unshift($currentQuotes, $quote);
    }

    $ok = saveStoredQuotes($dataFile, $currentQuotes);

    if ($ok === false) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to write data file on server']);
        exit;
    }

    echo json_encode([
        'success' => true,
        'action' => 'saved',
        'quote' => $quote,
        'totalStored' => count($currentQuotes),
        'timestamp' => $now
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'error' => 'Method not allowed']);
