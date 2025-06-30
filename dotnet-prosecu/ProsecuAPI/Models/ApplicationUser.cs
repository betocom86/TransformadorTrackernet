using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace ProsecuAPI.Models;

public class ApplicationUser : IdentityUser
{
    [StringLength(100)]
    public string? FirstName { get; set; }

    [StringLength(100)]
    public string? LastName { get; set; }

    [StringLength(50)]
    public string Role { get; set; } = "crew";

    public bool IsActive { get; set; } = true;

    public DateTime? LastLoginAt { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Calculated property
    public string FullName => $"{FirstName} {LastName}".Trim();
}