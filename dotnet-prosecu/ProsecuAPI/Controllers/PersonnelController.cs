using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProsecuAPI.Data;
using ProsecuAPI.Models;

namespace ProsecuAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PersonnelController : ControllerBase
{
    private readonly ProsecuDbContext _context;
    private readonly ILogger<PersonnelController> _logger;

    public PersonnelController(ProsecuDbContext context, ILogger<PersonnelController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Obtener todo el personal
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Personnel>>> GetPersonnel()
    {
        try
        {
            var personnel = await _context.Personnel
                .Include(p => p.Documents)
                .Include(p => p.CrewMemberships)
                    .ThenInclude(cm => cm.Crew)
                .Where(p => p.Status == "active")
                .OrderBy(p => p.FullName)
                .ToListAsync();

            return Ok(personnel);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener el personal");
            return StatusCode(500, "Error interno del servidor");
        }
    }

    /// <summary>
    /// Obtener personal por ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<Personnel>> GetPersonnel(int id)
    {
        try
        {
            var personnel = await _context.Personnel
                .Include(p => p.Documents)
                .Include(p => p.SafetyEquipment)
                .Include(p => p.Trainings)
                .Include(p => p.CrewMemberships)
                    .ThenInclude(cm => cm.Crew)
                .Include(p => p.ProjectAssignments)
                    .ThenInclude(pa => pa.Project)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (personnel == null)
            {
                return NotFound($"Personal con ID {id} no encontrado");
            }

            return Ok(personnel);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener el personal con ID {Id}", id);
            return StatusCode(500, "Error interno del servidor");
        }
    }

    /// <summary>
    /// Crear nuevo personal
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<Personnel>> CreatePersonnel(CreatePersonnelRequest request)
    {
        try
        {
            var personnel = new Personnel
            {
                FullName = request.FullName,
                EmployeeId = request.EmployeeId,
                Position = request.Position,
                Department = request.Department,
                HireDate = request.HireDate,
                Email = request.Email,
                Phone = request.Phone,
                Address = request.Address,
                DateOfBirth = request.DateOfBirth,
                PassportNumber = request.PassportNumber,
                VisaNumber = request.VisaNumber,
                VisaExpiry = request.VisaExpiry,
                Status = "active"
            };

            _context.Personnel.Add(personnel);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Personal creado: {FullName} (ID: {Id})", personnel.FullName, personnel.Id);

            return CreatedAtAction(nameof(GetPersonnel), new { id = personnel.Id }, personnel);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al crear el personal");
            return StatusCode(500, "Error interno del servidor");
        }
    }

    /// <summary>
    /// Actualizar personal existente
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePersonnel(int id, UpdatePersonnelRequest request)
    {
        try
        {
            var personnel = await _context.Personnel.FindAsync(id);
            if (personnel == null)
            {
                return NotFound($"Personal con ID {id} no encontrado");
            }

            // Actualizar campos
            personnel.FullName = request.FullName ?? personnel.FullName;
            personnel.Position = request.Position ?? personnel.Position;
            personnel.Department = request.Department ?? personnel.Department;
            personnel.Email = request.Email ?? personnel.Email;
            personnel.Phone = request.Phone ?? personnel.Phone;
            personnel.Address = request.Address ?? personnel.Address;
            personnel.VisaNumber = request.VisaNumber ?? personnel.VisaNumber;
            personnel.VisaExpiry = request.VisaExpiry ?? personnel.VisaExpiry;
            personnel.Status = request.Status ?? personnel.Status;
            personnel.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Personal actualizado: {FullName} (ID: {Id})", personnel.FullName, personnel.Id);

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al actualizar el personal con ID {Id}", id);
            return StatusCode(500, "Error interno del servidor");
        }
    }

    /// <summary>
    /// Eliminar personal (soft delete)
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePersonnel(int id)
    {
        try
        {
            var personnel = await _context.Personnel.FindAsync(id);
            if (personnel == null)
            {
                return NotFound($"Personal con ID {id} no encontrado");
            }

            // Soft delete - cambiar estado a inactive
            personnel.Status = "inactive";
            personnel.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Personal eliminado: {FullName} (ID: {Id})", personnel.FullName, personnel.Id);

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al eliminar el personal con ID {Id}", id);
            return StatusCode(500, "Error interno del servidor");
        }
    }

    /// <summary>
    /// Obtener documentos del personal
    /// </summary>
    [HttpGet("{id}/documents")]
    public async Task<ActionResult<IEnumerable<Document>>> GetPersonnelDocuments(int id)
    {
        try
        {
            var documents = await _context.Documents
                .Where(d => d.PersonnelId == id)
                .OrderBy(d => d.DocumentName)
                .ToListAsync();

            return Ok(documents);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener documentos del personal con ID {Id}", id);
            return StatusCode(500, "Error interno del servidor");
        }
    }

    /// <summary>
    /// Obtener personal con documentos próximos a vencer
    /// </summary>
    [HttpGet("expiring-documents")]
    public async Task<ActionResult<IEnumerable<object>>> GetPersonnelWithExpiringDocuments(int days = 30)
    {
        try
        {
            var expiryDate = DateTime.Now.AddDays(days);
            
            var personnel = await _context.Personnel
                .Include(p => p.Documents.Where(d => d.ExpiryDate <= expiryDate && d.Status == "valid"))
                .Where(p => p.Documents.Any(d => d.ExpiryDate <= expiryDate && d.Status == "valid"))
                .Select(p => new
                {
                    p.Id,
                    p.FullName,
                    p.Position,
                    ExpiringDocuments = p.Documents.Where(d => d.ExpiryDate <= expiryDate && d.Status == "valid")
                        .Select(d => new
                        {
                            d.DocumentName,
                            d.DocumentType,
                            d.ExpiryDate,
                            DaysUntilExpiry = (d.ExpiryDate!.Value - DateTime.Now).Days
                        })
                })
                .ToListAsync();

            return Ok(personnel);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener personal con documentos próximos a vencer");
            return StatusCode(500, "Error interno del servidor");
        }
    }
}

// DTOs para las requests
public class CreatePersonnelRequest
{
    public required string FullName { get; set; }
    public string? EmployeeId { get; set; }
    public string? Position { get; set; }
    public string? Department { get; set; }
    public DateTime? HireDate { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? PassportNumber { get; set; }
    public string? VisaNumber { get; set; }
    public DateTime? VisaExpiry { get; set; }
}

public class UpdatePersonnelRequest
{
    public string? FullName { get; set; }
    public string? Position { get; set; }
    public string? Department { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public string? VisaNumber { get; set; }
    public DateTime? VisaExpiry { get; set; }
    public string? Status { get; set; }
}