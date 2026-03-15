using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BookReadingApi.Data;
using BookReadingApi.Models;

namespace BookReadingApi.Controllers;


[Route("api/[controller]")]
[ApiController]
public class MasterTagsController : ControllerBase
{
    private readonly AppDbContext _context;
    public MasterTagsController(AppDbContext context) { _context = context; }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<MasterTag>>> GetMasterTags()
    {
        return await _context.MasterTags.ToListAsync();
    }
}