<?php

namespace App\Cms;

use App\Models\ActivityLog;
use Illuminate\Database\Eloquent\Model;

final class Audit
{
    /** @param array<int, string> $fields */
    public static function record(string $action, Model $subject, array $fields = []): void
    {
        $log = new ActivityLog;
        // Auditing central actions is an explicit unscoped write, never a client supplied company id.
        $log->forceFill(['company_id' => app(CompanyContext::class)->id, 'actor_id' => auth()->id(), 'action' => $action, 'subject_type' => class_basename($subject), 'subject_id' => $subject->getKey(), 'changes' => ['fields' => $fields]]);
        // Central operations have no tenant; scoped model creation otherwise derives ownership.
        if (app(CompanyContext::class)->id === null) {
            ActivityLog::withoutEvents(fn () => $log->save());
        } else {
            $log->save();
        }
    }
}
