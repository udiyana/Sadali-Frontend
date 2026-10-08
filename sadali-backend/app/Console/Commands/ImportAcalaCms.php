<?php

namespace App\Console\Commands;

use App\Cms\Imports\AcalaImporter;
use Illuminate\Console\Command;
use InvalidArgumentException;
use JsonException;
use Throwable;

class ImportAcalaCms extends Command
{
    protected $signature = 'cms:import-acala {--source= : Snapshot JSON path; defaults to database/data/acala/backend-dummy.json} {--dry-run : Validate without any database writes} {--publish : Explicitly activate and publish Acala} {--overwrite : Explicitly update existing snapshot records and the Acala name}';

    protected $description = 'Import Acala repository seed definitions into a tenant-scoped outlet, preserving existing edits by default';

    public function handle(AcalaImporter $importer): int
    {
        try {
            $source = $this->option('source');
            $path = is_string($source) && $source !== '' ? $source : database_path('data/acala/backend-dummy.json');
            $snapshot = $this->readSnapshot($path);
            $importer->validate($snapshot);
            $this->line('Source: '.$snapshot['source'].' (repository/dummy records, NOT live CMS database data)');
            if ($this->option('dry-run')) {
                $this->info('Dry run: snapshot valid; no database writes or publication performed.');
                foreach (['contents', 'datasets', 'images'] as $collection) {
                    $this->line($collection.': '.count($snapshot[$collection]).' source records');
                }

                return self::SUCCESS;
            }
            $report = $importer->import($snapshot, (bool) $this->option('overwrite'), (bool) $this->option('publish'));
            $this->info('Acala brand ID: '.$report['brand_id']);
            foreach (['contents', 'datasets', 'images'] as $collection) {
                $counts = $report[$collection];
                $this->line($collection.': created='.$counts['created'].' existing='.$counts['existing'].' updated='.$counts['updated']);
            }

            return self::SUCCESS;
        } catch (InvalidArgumentException $exception) {
            $this->error($exception->getMessage());
        } catch (Throwable) {
            // Database exceptions can contain raw records, credentials, or connection details.
            $this->error('Acala import failed; transaction rolled back. Check schema, permissions and outlet compatibility. No raw records or connection details are printed.');
        }

        return self::FAILURE;
    }

    /** @return array<string, mixed> */
    private function readSnapshot(string $path): array
    {
        // Explicitly reject stream wrappers/URLs; source is a local data file, never executable PHP.
        if (str_contains($path, '://') || ! is_file($path) || ! is_readable($path)) {
            throw new InvalidArgumentException('Snapshot must be a readable local JSON file.');
        }
        $stream = @fopen($path, 'rb');
        if ($stream === false) {
            throw new InvalidArgumentException('Snapshot could not be opened.');
        }
        try {
            $json = stream_get_contents($stream, AcalaImporter::MAX_BYTES + 1);
        } finally {
            fclose($stream);
        }
        if ($json === false || strlen($json) > AcalaImporter::MAX_BYTES) {
            throw new InvalidArgumentException('Snapshot exceeds the 10 MiB size limit or could not be read.');
        }
        try {
            $snapshot = json_decode($json, true, AcalaImporter::MAX_DEPTH, JSON_THROW_ON_ERROR);
        } catch (JsonException) {
            throw new InvalidArgumentException('Snapshot is invalid JSON or exceeds the depth limit.');
        }
        if (! is_array($snapshot) || array_is_list($snapshot)) {
            throw new InvalidArgumentException('Snapshot root must be a JSON object.');
        }

        return $snapshot;
    }
}
