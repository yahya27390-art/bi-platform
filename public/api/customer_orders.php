<?php
/**
 * Dorat Cars - Customer Special Orders Server API
 * Manages customer parts orders, supplier assignments, and lifecycle tracking.
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
$dataFile = $dataDir . '/customer_orders.json';
$htaccessFile = $dataDir . '/.htaccess';

if (!file_exists($dataDir)) {
    mkdir($dataDir, 0755, true);
}
if (!file_exists($htaccessFile)) {
    file_put_contents($htaccessFile, "Order Allow,Deny\nDeny from all\n");
}

function getStoredOrders($dataFile) {
    if (!file_exists($dataFile)) {
        return [];
    }
    $raw = @file_get_contents($dataFile);
    if (!$raw) return [];
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

function saveStoredOrders($dataFile, $orders) {
    $json = json_encode($orders, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    return @file_put_contents($dataFile, $json, LOCK_EX);
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $orders = getStoredOrders($dataFile);
    echo json_encode([
        'success' => true,
        'count' => count($orders),
        'orders' => $orders,
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
    $currentOrders = getStoredOrders($dataFile);
    $now = date('Y-m-d H:i:s');

    if ($action === 'delete') {
        $id = $payload['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Missing order id']);
            exit;
        }
        $filtered = array_values(array_filter($currentOrders, function($o) use ($id) {
            return ($o['id'] ?? '') !== $id;
        }));
        saveStoredOrders($dataFile, $filtered);
        echo json_encode(['success' => true, 'action' => 'deleted', 'id' => $id]);
        exit;
    }

    if ($action === 'update_status') {
        $id = $payload['id'] ?? null;
        $newStatus = $payload['status'] ?? null;
        if (!$id || !$newStatus) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Missing order id or status']);
            exit;
        }

        $found = false;
        foreach ($currentOrders as $idx => $order) {
            if (($order['id'] ?? '') === $id) {
                $currentOrders[$idx]['status'] = $newStatus;
                $currentOrders[$idx]['updatedAt'] = $now;
                $currentOrders[$idx]['statusHistory'][] = [
                    'status' => $newStatus,
                    'time' => $now,
                    'by' => $payload['staffName'] ?? 'الموظف'
                ];
                $found = true;
                break;
            }
        }

        if ($found) {
            saveStoredOrders($dataFile, $currentOrders);
            echo json_encode(['success' => true, 'action' => 'status_updated', 'id' => $id, 'status' => $newStatus]);
            exit;
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Order not found']);
            exit;
        }
    }

    // Default: save / upsert order
    $order = $payload['order'] ?? $payload;
    if (empty($order['id'])) {
        $order['id'] = 'ORD-' . date('Ymd') . '-' . substr(strval(round(microtime(true) * 1000)), -4);
    }
    if (empty($order['orderNumber'])) {
        $order['orderNumber'] = 'SO-' . date('ym') . '-' . sprintf('%03d', count($currentOrders) + 1);
    }
    if (empty($order['status'])) {
        $order['status'] = 'UNDER_ORDER'; // الحالة الأساسية: تحت الطلب
    }
    if (empty($order['orderDate'])) {
        $order['orderDate'] = date('Y-m-d');
    }
    $order['updatedAt'] = $now;

    $foundIndex = -1;
    foreach ($currentOrders as $idx => $existing) {
        if (($existing['id'] ?? '') === $order['id']) {
            $foundIndex = $idx;
            break;
        }
    }

    if ($foundIndex >= 0) {
        $currentOrders[$foundIndex] = array_merge($currentOrders[$foundIndex], $order);
    } else {
        if (empty($order['createdAt'])) {
            $order['createdAt'] = $now;
        }
        array_unshift($currentOrders, $order);
    }

    $ok = saveStoredOrders($dataFile, $currentOrders);

    if ($ok === false) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to write data file on server']);
        exit;
    }

    echo json_encode([
        'success' => true,
        'action' => 'saved',
        'order' => $order,
        'totalOrders' => count($currentOrders),
        'timestamp' => $now
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'error' => 'Method not allowed']);
