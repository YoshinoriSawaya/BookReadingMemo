using System.ComponentModel.DataAnnotations;

namespace BookReading.Api.Features.Books.DTOs;

public record BookRequest(
    [Required][StringLength(13)] string Isbn,

    [Required][StringLength(13)] string Ccode
);