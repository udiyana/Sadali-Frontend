<?php

namespace App\Policies;

use App\Models\Company;
use App\Models\User;

class CompanyPolicy
{
    public function view(User $user, Company $company): bool
    {
        return $user->is_super_admin || $company->users()->where('users.id', $user->id)->exists();
    }

    public function update(User $user, Company $company): bool
    {
        return $user->is_super_admin || $company->users()->where('users.id', $user->id)->wherePivot('role', 'company_admin')->exists();
    }

    public function editContent(User $user, Company $company): bool
    {
        return $this->view($user, $company);
    }

    public function publish(User $user, Company $company): bool
    {
        return $this->update($user, $company);
    }

    public function create(User $user): bool
    {
        return (bool) $user->is_super_admin;
    }

    public function delete(User $user, Company $company): bool
    {
        return (bool) $user->is_super_admin;
    }
}
